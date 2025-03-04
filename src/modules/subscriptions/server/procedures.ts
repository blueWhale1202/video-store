import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, gt, lt, or } from "drizzle-orm";
import { z } from "zod";

export const subscriptionsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({ creatorId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const { creatorId } = input;
            const { id: viewerId } = ctx.user;

            if (creatorId === viewerId) {
                throw new TRPCError({ code: "BAD_REQUEST" });
            }

            const [existingSubscription] = await db
                .select()
                .from(subscriptions)
                .where(
                    and(
                        eq(subscriptions.creatorId, creatorId),
                        eq(subscriptions.viewerId, viewerId),
                    ),
                );

            if (existingSubscription) {
                return existingSubscription;
            }

            const [subscription] = await db
                .insert(subscriptions)
                .values({
                    creatorId,
                    viewerId,
                })
                .returning();

            return subscription;
        }),
    remove: protectedProcedure
        .input(z.object({ creatorId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const { creatorId } = input;
            const { id: viewerId } = ctx.user;

            if (creatorId === viewerId) {
                throw new TRPCError({ code: "BAD_REQUEST" });
            }

            const [deletedSubscription] = await db
                .delete(subscriptions)
                .where(
                    and(
                        eq(subscriptions.creatorId, creatorId),
                        eq(subscriptions.viewerId, viewerId),
                    ),
                )
                .returning();

            return deletedSubscription;
        }),

    getMany: protectedProcedure
        .input(
            z.object({
                cursor: z
                    .object({
                        creatorId: z.string().uuid(),
                        updatedAt: z.date(),
                    })
                    .nullish(),
                limit: z.number().min(1).max(100).default(5),
            }),
        )
        .query(async ({ input, ctx }) => {
            const { cursor, limit } = input;
            const { id: userId } = ctx.user;

            const data = await db
                .select({
                    ...getTableColumns(subscriptions),
                    user: {
                        ...getTableColumns(users),
                        subscriberCount: db.$count(
                            subscriptions,
                            eq(subscriptions.creatorId, users.id),
                        ),
                    },
                })
                .from(subscriptions)
                .innerJoin(users, eq(subscriptions.creatorId, users.id))
                .where(
                    and(
                        eq(subscriptions.viewerId, userId),
                        cursor
                            ? or(
                                  lt(subscriptions.updatedAt, cursor.updatedAt),
                                  and(
                                      eq(
                                          subscriptions.updatedAt,
                                          cursor.updatedAt,
                                      ),
                                      gt(
                                          subscriptions.creatorId,
                                          cursor.creatorId,
                                      ),
                                  ),
                              )
                            : undefined,
                    ),
                )
                .orderBy(
                    desc(subscriptions.updatedAt),
                    desc(subscriptions.creatorId),
                )
                // add 1 to limit to check if there are more items
                .limit(limit + 1);

            const hasMore = data.length > limit;
            const items = hasMore ? data.slice(0, -1) : data;

            const lastItem = items[items.length - 1];
            const nextCursor = hasMore
                ? {
                      creatorId: lastItem.creatorId,
                      updatedAt: lastItem.updatedAt,
                  }
                : null;

            return { items, nextCursor };
        }),
});

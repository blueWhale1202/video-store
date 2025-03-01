import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
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
});

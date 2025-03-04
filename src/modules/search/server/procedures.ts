import { db } from "@/db";
import { users, videoReactions, videos, videoViews } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { and, desc, eq, getTableColumns, gt, ilike, lt, or } from "drizzle-orm";
import { z } from "zod";

export const searchRouter = createTRPCRouter({
    getMany: baseProcedure
        .input(
            z.object({
                query: z.string().optional(),
                categoryId: z.string().uuid().optional(),
                cursor: z
                    .object({
                        id: z.string().uuid(),
                        updatedAt: z.date(),
                    })
                    .nullish(),
                limit: z.number().min(1).max(100).default(5),
            }),
        )
        .query(async ({ input }) => {
            const { cursor, limit, categoryId, query } = input;

            const data = await db
                .select({
                    ...getTableColumns(videos),
                    user: users,
                    viewCount: db.$count(
                        videoViews,
                        eq(videoViews.videoId, videos.id),
                    ),
                    likedCount: db.$count(
                        videoReactions,
                        and(
                            eq(videoReactions.videoId, videos.id),
                            eq(videoReactions.type, "like"),
                        ),
                    ),
                    dislikedCount: db.$count(
                        videoReactions,
                        and(
                            eq(videoReactions.videoId, videos.id),
                            eq(videoReactions.type, "dislike"),
                        ),
                    ),
                })
                .from(videos)
                .innerJoin(users, eq(videos.userId, users.id))
                .where(
                    and(
                        ilike(videos.title, `%${query ?? ""}%`),
                        eq(videos.visibility, "public"),
                        categoryId
                            ? eq(videos.categoryId, categoryId)
                            : undefined,
                        cursor
                            ? or(
                                  lt(videos.updatedAt, cursor.updatedAt),
                                  and(
                                      eq(videos.updatedAt, cursor.updatedAt),
                                      gt(videos.id, cursor.id),
                                  ),
                              )
                            : undefined,
                    ),
                )
                .orderBy(desc(videos.updatedAt), desc(videos.id))
                // add 1 to limit to check if there are more items
                .limit(limit + 1);

            const hasMore = data.length > limit;
            const items = hasMore ? data.slice(0, -1) : data;

            const lastItem = items[items.length - 1];
            const nextCursor = hasMore
                ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
                : null;

            return { items, nextCursor };
        }),
});

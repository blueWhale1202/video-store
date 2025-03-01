import { db } from "@/db";
import { videoReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const videoReactionsRouter = createTRPCRouter({
    like: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;
            const { id } = input;

            const [likedVideo] = await db
                .select()
                .from(videoReactions)
                .where(
                    and(
                        eq(videoReactions.userId, userId),
                        eq(videoReactions.videoId, id),
                        eq(videoReactions.type, "like"),
                    ),
                );

            if (likedVideo) {
                const [deletedReaction] = await db
                    .delete(videoReactions)
                    .where(
                        and(
                            eq(videoReactions.userId, userId),
                            eq(videoReactions.videoId, id),
                            eq(videoReactions.type, "like"),
                        ),
                    )
                    .returning();

                return deletedReaction;
            }

            const [likedReaction] = await db
                .insert(videoReactions)
                .values({
                    userId,
                    videoId: id,
                    type: "like",
                })
                // if the user already disliked the video, update the reaction to like
                .onConflictDoUpdate({
                    target: [videoReactions.userId, videoReactions.videoId],
                    set: {
                        type: "like",
                    },
                })
                .returning();

            return likedReaction;
        }),
    dislike: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;
            const { id } = input;

            const [dislikedVideo] = await db
                .select()
                .from(videoReactions)
                .where(
                    and(
                        eq(videoReactions.userId, userId),
                        eq(videoReactions.videoId, id),
                        eq(videoReactions.type, "dislike"),
                    ),
                );

            if (dislikedVideo) {
                const [deletedReaction] = await db
                    .delete(videoReactions)
                    .where(
                        and(
                            eq(videoReactions.userId, userId),
                            eq(videoReactions.videoId, id),
                            eq(videoReactions.type, "dislike"),
                        ),
                    )
                    .returning();

                return deletedReaction;
            }

            const [dislikedReaction] = await db
                .insert(videoReactions)
                .values({
                    userId,
                    videoId: id,
                    type: "dislike",
                })
                // if the user already liked the video, update the reaction to dislike
                .onConflictDoUpdate({
                    target: [videoReactions.userId, videoReactions.videoId],
                    set: {
                        type: "dislike",
                    },
                })
                .returning();

            return dislikedReaction;
        }),
});

import { db } from "@/db";
import { commentReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const commentReactionsRouter = createTRPCRouter({
    like: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;
            const { id } = input;

            const [likedComment] = await db
                .select()
                .from(commentReactions)
                .where(
                    and(
                        eq(commentReactions.userId, userId),
                        eq(commentReactions.commentId, id),
                        eq(commentReactions.type, "like"),
                    ),
                );

            if (likedComment) {
                const [deletedReaction] = await db
                    .delete(commentReactions)
                    .where(
                        and(
                            eq(commentReactions.userId, userId),
                            eq(commentReactions.commentId, id),
                            eq(commentReactions.type, "like"),
                        ),
                    )
                    .returning();

                return deletedReaction;
            }

            const [likedReaction] = await db
                .insert(commentReactions)
                .values({
                    userId,
                    commentId: id,
                    type: "like",
                })
                // if the user already disliked the comment, update the reaction to like
                .onConflictDoUpdate({
                    target: [
                        commentReactions.userId,
                        commentReactions.commentId,
                    ],
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

            const [dislikedComment] = await db
                .select()
                .from(commentReactions)
                .where(
                    and(
                        eq(commentReactions.userId, userId),
                        eq(commentReactions.commentId, id),
                        eq(commentReactions.type, "dislike"),
                    ),
                );

            if (dislikedComment) {
                const [deletedReaction] = await db
                    .delete(commentReactions)
                    .where(
                        and(
                            eq(commentReactions.userId, userId),
                            eq(commentReactions.commentId, id),
                            eq(commentReactions.type, "dislike"),
                        ),
                    )
                    .returning();

                return deletedReaction;
            }

            const [dislikedReaction] = await db
                .insert(commentReactions)
                .values({
                    userId,
                    commentId: id,
                    type: "dislike",
                })
                // if the user already liked the comment, update the reaction to dislike
                .onConflictDoUpdate({
                    target: [
                        commentReactions.userId,
                        commentReactions.commentId,
                    ],
                    set: {
                        type: "dislike",
                    },
                })
                .returning();

            return dislikedReaction;
        }),
});

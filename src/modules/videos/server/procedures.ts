import { utapi } from "@/app/api/uploadthing/core";
import { db } from "@/db";
import {
    subscriptions,
    users,
    videoReactions,
    videos,
    videoUpdateSchema,
    videoViews,
} from "@/db/schema";
import { getMuxThumbnailUrl, mux } from "@/lib/mux";
import { workflow } from "@/lib/workflow";
import {
    baseProcedure,
    createTRPCRouter,
    protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, inArray, isNotNull } from "drizzle-orm";
import { z } from "zod";

export const videoRouter = createTRPCRouter({
    create: protectedProcedure.mutation(async ({ ctx }) => {
        const { id: userId } = ctx.user;

        const upload = await mux.video.uploads.create({
            cors_origin: "*", // TODO: set this to the domain of your app
            new_asset_settings: {
                playback_policy: ["public"],
                passthrough: userId,
                input: [
                    {
                        generated_subtitles: [
                            {
                                language_code: "en",
                                name: "English",
                            },
                        ],
                    },
                ],
            },
        });

        const [video] = await db
            .insert(videos)
            .values({
                userId,
                title: "Untitled",
                muxStatus: "waiting",
                muxUploadId: upload.id,
            })
            .returning();

        return {
            video,
            url: upload.url,
        };
    }),

    update: protectedProcedure
        .input(videoUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;

            if (!input.id) {
                throw new TRPCError({ code: "BAD_REQUEST" });
            }

            const [video] = await db
                .update(videos)
                .set({
                    title: input.title,
                    description: input.description,
                    categoryId: input.categoryId,
                    visibility: input.visibility,
                    updatedAt: new Date(),
                })
                .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
                .returning();

            if (!video) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            return video;
        }),

    remove: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;
            const { id } = input;

            const [video] = await db
                .delete(videos)
                .where(and(eq(videos.id, id), eq(videos.userId, userId)))
                .returning();

            if (!video) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            if (video.thumbnailKey && video.previewKey) {
                await utapi.deleteFiles([video.thumbnailKey, video.previewKey]);
            }

            if (video.muxAssetId) {
                await mux.video.assets.delete(video.muxAssetId);
            }

            return video;
        }),
    restoreThumbnail: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;
            const { id } = input;

            const [existingVideo] = await db
                .select()
                .from(videos)
                .where(and(eq(videos.id, id), eq(videos.userId, userId)));

            if (!existingVideo) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            if (!existingVideo.muxPlaybackId) {
                throw new TRPCError({ code: "BAD_REQUEST" });
            }

            if (existingVideo.thumbnailKey) {
                await utapi.deleteFiles(existingVideo.thumbnailKey);
            }

            const tempThumbnailUrl = getMuxThumbnailUrl(
                existingVideo.muxPlaybackId,
            );
            const uploadedThumbnail =
                await utapi.uploadFilesFromUrl(tempThumbnailUrl);

            if (!uploadedThumbnail.data) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            }

            const { ufsUrl: thumbnailUrl, key: thumbnailKey } =
                uploadedThumbnail.data;

            const [video] = await db
                .update(videos)
                .set({
                    thumbnailUrl,
                    thumbnailKey,
                })
                .where(and(eq(videos.id, id), eq(videos.userId, userId)))
                .returning();

            return video;
        }),
    generateTitle: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;
            const { id } = input;

            const { workflowRunId } = await workflow.trigger({
                url: `${process.env.UPSTASH_WORKFLOW_URL!}/api/videos/workflows/title`,
                body: { userId, videoId: id },
                retries: 0,
            });

            return workflowRunId;
        }),
    generateDescription: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;
            const { id } = input;

            const { workflowRunId } = await workflow.trigger({
                url: `${process.env.UPSTASH_WORKFLOW_URL!}/api/videos/workflows/description`,
                body: { userId, videoId: id },
                retries: 0,
            });

            return workflowRunId;
        }),
    generateThumbnail: protectedProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                prompt: z.string().min(10).max(200),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;
            const { id, prompt } = input;

            const { workflowRunId } = await workflow.trigger({
                url: `${process.env.UPSTASH_WORKFLOW_URL!}/api/videos/workflows/thumbnail`,
                body: { userId, videoId: id, prompt },
                retries: 0,
            });

            return workflowRunId;
        }),
    getOne: baseProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
            const { clerkUserId } = ctx;
            const { id } = input;

            let userId;

            const [user] = await db
                .select()
                .from(users)
                .where(
                    inArray(users.clerkId, clerkUserId ? [clerkUserId] : []),
                );

            if (user) {
                userId = user.id;
            }

            const viewerReactions = db.$with("viewer_reactions").as(
                db
                    .select({
                        videoId: videoReactions.videoId,
                        type: videoReactions.type,
                    })
                    .from(videoReactions)
                    .where(
                        inArray(videoReactions.userId, userId ? [userId] : []),
                    ),
            );

            const viewerSubscriptions = db.$with("viewer_subscriptions").as(
                db
                    .select()
                    .from(subscriptions)
                    .where(
                        inArray(subscriptions.viewerId, userId ? [userId] : []),
                    ),
            );

            const [existingVideo] = await db
                .with(viewerReactions, viewerSubscriptions)
                .select({
                    ...getTableColumns(videos),
                    user: {
                        ...getTableColumns(users),
                        subscriptionCount: db.$count(
                            subscriptions,
                            eq(subscriptions.creatorId, users.id),
                        ),
                        viewerSubscribed: isNotNull(
                            viewerSubscriptions.viewerId,
                        ).mapWith(Boolean),
                    },
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
                    viewerReaction: viewerReactions.type,
                })
                .from(videos)
                .innerJoin(users, eq(videos.userId, users.id))
                .leftJoin(
                    viewerReactions,
                    eq(viewerReactions.videoId, videos.id),
                )
                .leftJoin(
                    viewerSubscriptions,
                    eq(viewerSubscriptions.creatorId, users.id),
                )
                .where(eq(videos.id, id));

            if (!existingVideo) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            return existingVideo;
        }),
});

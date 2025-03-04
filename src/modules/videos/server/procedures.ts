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
import {
    and,
    desc,
    eq,
    getTableColumns,
    gt,
    inArray,
    isNotNull,
    lt,
    or,
} from "drizzle-orm";
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
    revalidate: protectedProcedure
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

            if (!existingVideo.muxUploadId) {
                throw new TRPCError({ code: "BAD_REQUEST" });
            }

            const upload = await mux.video.uploads.retrieve(
                existingVideo.muxUploadId,
            );

            if (!upload || !upload.asset_id) {
                throw new TRPCError({ code: "BAD_REQUEST" });
            }

            const asset = await mux.video.assets.retrieve(upload.asset_id);

            if (!asset) {
                throw new TRPCError({ code: "BAD_REQUEST" });
            }

            const duration = asset.duration
                ? Math.floor(asset.duration * 1000)
                : 0;

            const [updatedVideo] = await db
                .update(videos)
                .set({
                    muxStatus: asset.status,
                    muxPlaybackId: asset.playback_ids?.[0].id,
                    muxAssetId: asset.id,
                    duration,
                })
                .where(and(eq(videos.id, id), eq(videos.userId, userId)))
                .returning();

            return updatedVideo;
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
    getMany: baseProcedure
        .input(
            z.object({
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
            const { cursor, limit, categoryId } = input;

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
    getManyTrending: baseProcedure
        .input(
            z.object({
                cursor: z
                    .object({
                        id: z.string().uuid(),
                        viewCount: z.number(),
                    })
                    .nullish(),
                limit: z.number().min(1).max(100).default(5),
            }),
        )
        .query(async ({ input }) => {
            const { cursor, limit } = input;

            const viewCountSubquery = db.$count(
                videoViews,
                eq(videoViews.videoId, videos.id),
            );

            const data = await db
                .select({
                    ...getTableColumns(videos),
                    user: users,
                    viewCount: viewCountSubquery,
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
                        eq(videos.visibility, "public"),

                        cursor
                            ? or(
                                  lt(viewCountSubquery, cursor.viewCount),
                                  and(
                                      eq(viewCountSubquery, cursor.viewCount),
                                      gt(videos.id, cursor.id),
                                  ),
                              )
                            : undefined,
                    ),
                )
                .orderBy(desc(viewCountSubquery), desc(videos.id))
                // add 1 to limit to check if there are more items
                .limit(limit + 1);

            const hasMore = data.length > limit;
            const items = hasMore ? data.slice(0, -1) : data;

            const lastItem = items[items.length - 1];
            const nextCursor = hasMore
                ? { id: lastItem.id, viewCount: lastItem.viewCount }
                : null;

            return { items, nextCursor };
        }),

    getManySubscribed: protectedProcedure
        .input(
            z.object({
                cursor: z
                    .object({
                        id: z.string().uuid(),
                        updatedAt: z.date(),
                    })
                    .nullish(),
                limit: z.number().min(1).max(100).default(5),
            }),
        )
        .query(async ({ input, ctx }) => {
            const { cursor, limit } = input;
            const { id: userId } = ctx.user;

            const viewerSubscriptions = db.$with("viewer_subscriptions").as(
                db
                    .select({
                        userId: subscriptions.creatorId,
                    })
                    .from(subscriptions)
                    .where(eq(subscriptions.viewerId, userId)),
            );

            const data = await db
                .with(viewerSubscriptions)
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
                .innerJoin(
                    viewerSubscriptions,
                    eq(viewerSubscriptions.userId, users.id),
                )
                .where(
                    and(
                        eq(videos.visibility, "public"),

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

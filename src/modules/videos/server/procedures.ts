import { utapi } from "@/app/api/uploadthing/core";
import { db } from "@/db";
import { videos, videoUpdateSchema } from "@/db/schema";
import { getMuxThumbnailUrl, mux } from "@/lib/mux";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
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
    getOne: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
            const { id: userId } = ctx.user;
            const { id } = input;

            const [video] = await db
                .select()
                .from(videos)
                .where(and(eq(videos.id, id), eq(videos.userId, userId)));

            if (!video) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            return video;
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
});

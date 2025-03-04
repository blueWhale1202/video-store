import { utapi } from "@/app/api/uploadthing/core";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { getMuxPreviewUrl, getMuxThumbnailUrl } from "@/lib/mux";
import { VideoAssetReadyWebhookEvent } from "@mux/mux-node/resources/webhooks.mjs";
import { TRPCError } from "@trpc/server";
import { serve } from "@upstash/workflow/nextjs";
import { eq } from "drizzle-orm";

type Input = {
    data: VideoAssetReadyWebhookEvent["data"];
    playbackId: string;
    duration: number;
};

export const { POST } = serve(async (context) => {
    const { data, playbackId, duration } = context.requestPayload as Input;

    const { thumbnailUrl, thumbnailKey, previewUrl, previewKey } =
        await context.run("upload-images", async () => {
            const tempThumbnailUrl = getMuxThumbnailUrl(playbackId);
            const tempPreviewUrl = getMuxPreviewUrl(playbackId);

            const [uploadedThumbnail, uploadedPreview] =
                await utapi.uploadFilesFromUrl([
                    tempThumbnailUrl,
                    tempPreviewUrl,
                ]);

            if (!uploadedThumbnail.data || !uploadedPreview.data) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            }

            const { ufsUrl: thumbnailUrl, key: thumbnailKey } =
                uploadedThumbnail.data;
            const { ufsUrl: previewUrl, key: previewKey } =
                uploadedPreview.data;

            return {
                thumbnailUrl,
                thumbnailKey,
                previewUrl,
                previewKey,
            };
        });

    await context.run("update-video", async () => {
        await db
            .update(videos)
            .set({
                muxStatus: data.status,
                muxPlaybackId: playbackId,
                muxAssetId: data.id,
                thumbnailUrl,
                thumbnailKey,
                previewUrl,
                previewKey,
                duration,
            })
            .where(eq(videos.muxUploadId, data.upload_id!));
    });
});

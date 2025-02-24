import { db } from "@/db";
import { videos } from "@/db/schema";
import { getMuxPreviewUrl, getMuxThumbnailUrl, mux } from "@/lib/mux";
import {
    VideoAssetCreatedWebhookEvent,
    VideoAssetDeletedWebhookEvent,
    VideoAssetErroredWebhookEvent,
    VideoAssetReadyWebhookEvent,
    VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks.mjs";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { utapi } from "../../uploadthing/core";

const SIGNIN_SECRET = process.env.MUX_WEBHOOK_SECRET!;

type WebhookEvent =
    | VideoAssetCreatedWebhookEvent
    | VideoAssetReadyWebhookEvent
    | VideoAssetErroredWebhookEvent
    | VideoAssetDeletedWebhookEvent
    | VideoAssetTrackReadyWebhookEvent;

export const POST = async (request: Request) => {
    if (!SIGNIN_SECRET) {
        throw new Error("No MUX_WEBHOOK_SECRET provided");
    }

    const headersPayload = await headers();
    const muxSignature = headersPayload.get("mux-signature");

    if (!muxSignature) {
        return new Response("No signature provided", { status: 401 });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    mux.webhooks.verifySignature(
        body,
        {
            "mux-signature": muxSignature,
        },
        SIGNIN_SECRET,
    );

    switch (payload.type as WebhookEvent["type"]) {
        case "video.asset.created": {
            const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

            if (!data.upload_id) {
                return new Response("No upload ID found", { status: 400 });
            }

            await db
                .update(videos)
                .set({
                    muxAssetId: data.id,
                    muxStatus: data.status,
                })
                .where(eq(videos.muxUploadId, data.upload_id));
            break;
        }
        case "video.asset.ready": {
            const data = payload.data as VideoAssetReadyWebhookEvent["data"];
            const playbackId = data.playback_ids?.[0].id;

            if (!data.upload_id) {
                return new Response("No upload ID found", { status: 400 });
            }

            const duration = data.duration
                ? Math.floor(data.duration * 1000)
                : 0;

            if (!playbackId) {
                return new Response("Missing playback ID", { status: 400 });
            }

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
                .where(eq(videos.muxUploadId, data.upload_id));
            break;
        }

        case "video.asset.errored": {
            const data = payload.data as VideoAssetErroredWebhookEvent["data"];

            if (!data.upload_id) {
                return new Response("No upload ID found", { status: 400 });
            }

            await db
                .update(videos)
                .set({
                    muxStatus: data.status,
                })
                .where(eq(videos.muxUploadId, data.upload_id));
            break;
        }

        case "video.asset.deleted": {
            const data = payload.data as VideoAssetDeletedWebhookEvent["data"];

            if (!data.upload_id) {
                return new Response("No upload ID found", { status: 400 });
            }

            await db
                .delete(videos)
                .where(eq(videos.muxUploadId, data.upload_id));

            break;
        }

        case "video.asset.track.ready": {
            const data =
                payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
                    // missing data.asset_id in video.asset.track.ready webhook event
                    // https://github.com/muxinc/mux-node-sdk/issues/446
                    asset_id: string;
                };

            const assetId = data.asset_id;
            const trackId = data.id;
            const status = data.status;

            if (!assetId) {
                return new Response("Missing asset ID", { status: 400 });
            }

            await db
                .update(videos)
                .set({
                    muxTrackId: trackId,
                    muxTrackStatus: status,
                })
                .where(eq(videos.muxAssetId, assetId));

            break;
        }
    }

    return new Response("Webhook received", { status: 200 });
};

import { db } from "@/db";
import { videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import { workflow } from "@/lib/workflow";
import {
    VideoAssetCreatedWebhookEvent,
    VideoAssetDeletedWebhookEvent,
    VideoAssetErroredWebhookEvent,
    VideoAssetReadyWebhookEvent,
    VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks.mjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

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

    const payloadType = payload.type as WebhookEvent["type"];

    if (payloadType === "video.asset.created") {
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
    }

    if (payloadType === "video.asset.ready") {
        const data = payload.data as VideoAssetReadyWebhookEvent["data"];
        const playbackId = data.playback_ids?.[0].id;

        if (!data.upload_id) {
            return new Response("No upload ID found", { status: 400 });
        }

        const duration = data.duration ? Math.floor(data.duration * 1000) : 0;

        if (!playbackId) {
            return new Response("Missing playback ID", { status: 400 });
        }

        await workflow.trigger({
            url: `${process.env.UPSTASH_WORKFLOW_URL!}/api/videos/workflows/upload-images`,
            body: { data, playbackId, duration },
        });
    }

    if (payloadType === "video.asset.deleted") {
        const data = payload.data as VideoAssetDeletedWebhookEvent["data"];

        if (!data.upload_id) {
            return new Response("No upload ID found", { status: 400 });
        }

        await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id));
    }

    if (payloadType === "video.asset.track.ready") {
        {
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
        }
    }

    if (payloadType === "video.asset.errored") {
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
    }
    return new Response("Webhook received", { status: 200 });
};

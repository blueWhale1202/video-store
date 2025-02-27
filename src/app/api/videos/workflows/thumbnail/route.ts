import { utapi } from "@/app/api/uploadthing/core";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

type Input = {
    userId: string;
    videoId: string;
    prompt: string;
};

export const { POST } = serve(async (context) => {
    const { userId, videoId, prompt } = context.requestPayload as Input;

    const video = await context.run("get-video", async () => {
        const [existingVideo] = await db
            .select()
            .from(videos)
            .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

        if (!existingVideo) {
            throw new Error("Video not found");
        }

        return existingVideo;
    });

    const { body } = await context.call<{ data: Array<{ url: string }> }>(
        "generate-thumbnail",
        {
            url: "https://api.openai.com/v1/images/generations",
            method: "POST",
            body: {
                prompt,
                model: "dall-e-3",
                n: 1,
                size: "1792x1024",
                style: "vivid",
            },
            headers: {
                authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
        },
    );

    const tempThumbnailUrl = body.data[0].url;

    if (!tempThumbnailUrl) {
        throw new Error("Failed to generate thumbnail");
    }

    const uploadedThumbnail = await context.run(
        "upload-thumbnail",
        async () => {
            const { data } = await utapi.uploadFilesFromUrl(tempThumbnailUrl);

            if (!data) {
                throw new Error("Failed to upload thumbnail");
            }

            return data;
        },
    );

    await context.run("cleanup-thumbnail", async () => {
        if (video.thumbnailKey) {
            await utapi.deleteFiles(video.thumbnailKey);
        }
    });

    await context.run("update-video", async () => {
        await db
            .update(videos)
            .set({
                thumbnailKey: uploadedThumbnail.key,
                thumbnailUrl: uploadedThumbnail.ufsUrl,
            })
            .where(and(eq(videos.id, video.id), eq(videos.userId, userId)));
    });
});

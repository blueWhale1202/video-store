import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();
export const utapi = new UTApi();

export const ourFileRouter = {
    thumbnailUploader: f({
        image: {
            maxFileSize: "4MB",
            maxFileCount: 1,
        },
    })
        .input(
            z.object({
                videoId: z.string().uuid(),
            }),
        )
        .middleware(async ({ input }) => {
            const { userId: clerkUserId } = await auth();

            if (!clerkUserId) {
                throw new UploadThingError("Unauthorized");
            }

            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.clerkId, clerkUserId));

            if (!user) {
                throw new UploadThingError("Unauthorized");
            }

            const [existingVideo] = await db
                .select({ thumbnailKey: videos.thumbnailKey })
                .from(videos)
                .where(eq(videos.id, input.videoId));

            if (!existingVideo) {
                throw new UploadThingError("Video not found");
            }

            if (existingVideo.thumbnailKey) {
                await utapi.deleteFiles(existingVideo.thumbnailKey);
            }

            return { user, ...input };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            await db
                .update(videos)
                .set({
                    thumbnailUrl: file.ufsUrl,
                    thumbnailKey: file.key,
                })
                .where(
                    and(
                        eq(videos.id, metadata.videoId),
                        eq(videos.userId, metadata.user.id),
                    ),
                );

            return { uploadedBy: metadata.user.id };
        }),
    bannerUploader: f({
        image: {
            maxFileSize: "8MB",
            maxFileCount: 1,
        },
    })
        .middleware(async () => {
            const { userId: clerkUserId } = await auth();

            if (!clerkUserId) {
                throw new UploadThingError("Unauthorized");
            }

            const [existingUser] = await db
                .select()
                .from(users)
                .where(eq(users.clerkId, clerkUserId));

            if (!existingUser) {
                throw new UploadThingError("Unauthorized");
            }

            if (existingUser.bannerKey) {
                await utapi.deleteFiles(existingUser.bannerKey);
            }

            return { userId: existingUser.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            await db
                .update(users)
                .set({
                    bannerUrl: file.ufsUrl,
                    bannerKey: file.key,
                })
                .where(eq(users.id, metadata.userId));

            return { uploadedBy: metadata.userId };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

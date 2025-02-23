import { db } from "@/db";
import { videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

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
});

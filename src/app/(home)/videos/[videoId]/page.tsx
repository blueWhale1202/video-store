import { VideoView } from "@/modules/videos/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";

type Props = {
    params: Promise<{ videoId: string }>;
};

export default async function VideoIdPage({ params }: Props) {
    const { videoId } = await params;

    void trpc.videos.getOne.prefetch({ id: videoId });

    return (
        <HydrateClient>
            <VideoView id={videoId} />
        </HydrateClient>
    );
}

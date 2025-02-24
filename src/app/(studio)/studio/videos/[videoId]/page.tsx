import { VideoView } from "@/modules/videos/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{
        videoId: string;
    }>;
};

export default async function VideoPage({ params }: Props) {
    const { videoId } = await params;
    void trpc.videos.getOne.prefetch({
        id: videoId,
    });
    void trpc.categories.getMany.prefetch();

    return (
        <HydrateClient>
            <VideoView videoId={videoId} />
        </HydrateClient>
    );
}

import Link from "next/link";
import { VideoGetManyOutput } from "../../types";
import { VideoInfo, VideoInfoSkeleton } from "./video-info";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";

type Props = {
    data: VideoGetManyOutput["items"][number];
    onRemove?: () => void;
};

export const VideoGridCard = ({ data, onRemove }: Props) => {
    return (
        <div className="group flex w-full flex-col gap-2">
            <Link prefetch href={`/videos/${data.id}`}>
                <VideoThumbnail
                    imageUrl={data.thumbnailUrl}
                    previewUrl={data.previewUrl}
                    title={data.title}
                    duration={data.duration}
                />
            </Link>
            <VideoInfo data={data} onRemove={onRemove} />
        </div>
    );
};

export const VideoGridCardSkeleton = () => {
    return (
        <div className="flex w-full flex-col gap-2">
            <VideoThumbnailSkeleton />
            <VideoInfoSkeleton />
        </div>
    );
};

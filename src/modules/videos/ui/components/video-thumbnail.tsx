import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/utils";
import Image from "next/image";

type Props = {
    title: string;
    imageUrl: string;
    previewUrl: string;
    duration: number;
};

export const VideoThumbnail = ({
    title,
    imageUrl,
    previewUrl,
    duration,
}: Props) => {
    return (
        <div className="group relative">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="size-full object-cover group-hover:opacity-0"
                />
                <Image
                    unoptimized={!!previewUrl}
                    src={previewUrl}
                    alt={title}
                    fill
                    className="size-full object-cover opacity-0 group-hover:opacity-100"
                />
            </div>
            <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
                {formatDuration(duration)}
            </div>
        </div>
    );
};

export const VideoThumbnailSkeleton = () => {
    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <Skeleton className="size-full" />
        </div>
    );
};

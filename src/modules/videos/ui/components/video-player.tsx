import { Skeleton } from "@/components/ui/skeleton";
import MuxPlayer from "@mux/mux-player-react";
import { THUMBNAIL_FALLBACK } from "../../constants";

type Props = {
    playbackId?: string | null;
    thumbnailUrl?: string | null;
    autoPlay?: boolean;
    onPlay?: () => void;
};

export const VideoPlayer = ({
    playbackId,
    thumbnailUrl,
    autoPlay,
    onPlay,
}: Props) => {
    return (
        <MuxPlayer
            playbackId={playbackId ?? ""}
            poster={thumbnailUrl ?? THUMBNAIL_FALLBACK}
            playerInitTime={0}
            autoPlay={autoPlay}
            thumbnailTime={0}
            className="size-full object-contain"
            accentColor="#FF2056"
            onPlay={onPlay}
        />
    );
};

export const VideoPlayerSkeleton = () => {
    return <Skeleton className="aspect-video rounded-xl" />;
};

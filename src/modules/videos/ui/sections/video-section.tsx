"use client";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useAuth } from "@clerk/nextjs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { VideoBanner } from "../components/video-banner";
import { VideoPlayer, VideoPlayerSkeleton } from "../components/video-player";
import { VideoTopRow, VideoTopRowSkeleton } from "../components/video-top-row";

type Props = {
    id: string;
};

export const VideoSectionSkeleton = () => {
    return (
        <>
            <VideoPlayerSkeleton />
            <VideoTopRowSkeleton />
        </>
    );
};

export const VideoSection = ({ id }: Props) => {
    return (
        <ErrorBoundary fallback={<div>Error</div>}>
            <Suspense fallback={<VideoSectionSkeleton />}>
                <VideoSectionSuspense id={id} />
            </Suspense>
        </ErrorBoundary>
    );
};

export const VideoSectionSuspense = ({ id }: Props) => {
    const { isSignedIn } = useAuth();

    const utils = trpc.useUtils();
    const [video] = trpc.videos.getOne.useSuspenseQuery({ id });

    const createView = trpc.videoViews.create.useMutation({
        onSuccess() {
            utils.videos.getOne.invalidate({ id });
            utils.playlists.getHistory.invalidate();
        },
    });

    const onPlay = () => {
        if (!isSignedIn) {
            return;
        }

        createView.mutate({ videoId: id });
    };

    return (
        <>
            <div
                className={cn(
                    "relative aspect-video overflow-hidden rounded-xl bg-black",
                    video.muxStatus !== "ready" && "rounded-b-none",
                )}
            >
                <VideoPlayer
                    autoPlay
                    onPlay={onPlay}
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                />
            </div>
            <VideoBanner status={video.muxStatus} />
            <VideoTopRow video={video} />
        </>
    );
};

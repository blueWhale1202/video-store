"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import {
    VideoGridCard,
    VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const TrendingVideosSectionSuspense = () => {
    const [videos, query] =
        trpc.videos.getManyTrending.useSuspenseInfiniteQuery(
            {
                limit: DEFAULT_LIMIT,
            },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        );

    return (
        <div>
            <div className="grid grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6">
                {videos.pages
                    .flatMap((page) => page.items)
                    .map((video) => (
                        <VideoGridCard key={video.id} data={video} />
                    ))}
            </div>
            <InfiniteScroll
                hasNextPage={query.hasNextPage}
                fetchNextPage={query.fetchNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
            />
        </div>
    );
};

export const TrendingVideosSectionSkeleton = () => {
    return (
        <div className="grid grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => (
                <VideoGridCardSkeleton key={i} />
            ))}
        </div>
    );
};

export const TrendingVideosSection = () => {
    return (
        <ErrorBoundary fallback={<div>Error</div>}>
            <Suspense fallback={<TrendingVideosSectionSkeleton />}>
                <TrendingVideosSectionSuspense />
            </Suspense>
        </ErrorBoundary>
    );
};

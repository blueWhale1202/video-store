"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
    PlaylistGridCard,
    PlaylistGridCardSkeleton,
} from "../components/playlist-grid-card";

export const PlaylistsSectionSuspense = () => {
    const [videos, query] = trpc.playlists.getMany.useSuspenseInfiniteQuery(
        {
            limit: DEFAULT_LIMIT,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );
    console.log(
        "🚀 ~ PlaylistsSectionSuspense ~ videos:",
        videos.pages.flatMap((page) => page.items),
    );

    return (
        <>
            <div className="grid grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6">
                {videos.pages
                    .flatMap((page) => page.items)
                    .map((playlist) => (
                        <PlaylistGridCard key={playlist.id} data={playlist} />
                    ))}
            </div>

            <InfiniteScroll
                hasNextPage={query.hasNextPage}
                fetchNextPage={query.fetchNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
            />
        </>
    );
};

export const PlaylistsSectionSkeleton = () => {
    return (
        <div className="grid grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => (
                <PlaylistGridCardSkeleton key={i} />
            ))}
        </div>
    );
};

export const PlaylistsSection = () => {
    return (
        <ErrorBoundary fallback={<div>Error</div>}>
            <Suspense fallback={<PlaylistsSectionSkeleton />}>
                <PlaylistsSectionSuspense />
            </Suspense>
        </ErrorBoundary>
    );
};

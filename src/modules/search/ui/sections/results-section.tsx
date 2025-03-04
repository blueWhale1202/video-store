"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    VideoGridCard,
    VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import {
    VideoRowCard,
    VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
    query?: string;
    categoryId?: string;
};

export const ResultsSectionSuspense = ({ query, categoryId }: Props) => {
    const [results, resultQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
        {
            query,
            categoryId,
            limit: DEFAULT_LIMIT,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );

    const isMobile = useIsMobile();

    return (
        <>
            {isMobile ? (
                <div className="flex flex-col gap-4 gap-y-10">
                    {results.pages
                        .flatMap((page) => page.items)
                        .map((video) => (
                            <VideoGridCard key={video.id} data={video} />
                        ))}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {results.pages
                        .flatMap((page) => page.items)
                        .map((video) => (
                            <VideoRowCard key={video.id} data={video} />
                        ))}
                </div>
            )}
            <InfiniteScroll
                hasNextPage={resultQuery.hasNextPage}
                fetchNextPage={resultQuery.fetchNextPage}
                isFetchingNextPage={resultQuery.isFetchingNextPage}
            />
        </>
    );
};

export const ResultsSectionSkeleton = () => {
    return (
        <div>
            <div className="hidden flex-col gap-4 md:flex">
                {Array.from({ length: 5 }).map((_, index) => (
                    <VideoRowCardSkeleton key={index} />
                ))}
            </div>
            <div className="flex flex-col gap-4 gap-y-10 p-4 pt-6 md:hidden">
                {Array.from({ length: 5 }).map((_, index) => (
                    <VideoGridCardSkeleton key={index} />
                ))}
            </div>
        </div>
    );
};

export const ResultsSection = ({ query, categoryId }: Props) => {
    return (
        <ErrorBoundary
            fallback={<div>ResultsSection error </div>}
            key={`${query}-${categoryId}`}
        >
            <Suspense fallback={<ResultsSectionSkeleton />}>
                <ResultsSectionSuspense query={query} categoryId={categoryId} />
            </Suspense>
        </ErrorBoundary>
    );
};

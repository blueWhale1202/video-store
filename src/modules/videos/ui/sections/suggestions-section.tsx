"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
    VideoGridCard,
    VideoGridCardSkeleton,
} from "../components/video-grid-card";
import {
    VideoRowCard,
    VideoRowCardSkeleton,
} from "../components/video-row-card";

type Props = {
    videoId: string;
    isManual?: boolean;
};

export const SuggestionsSectionSuspense = ({ videoId, isManual }: Props) => {
    const [suggestions, query] =
        trpc.suggestions.getMany.useSuspenseInfiniteQuery(
            {
                videoId,
                limit: DEFAULT_LIMIT,
            },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        );

    return (
        <>
            <div className="hidden space-y-3 md:block">
                {suggestions.pages
                    .flatMap((page) => page.items)
                    .map((suggestion) => (
                        <VideoRowCard
                            key={suggestion.id}
                            data={suggestion}
                            size="compact"
                        />
                    ))}
            </div>
            <div className="block space-y-10 md:hidden">
                {suggestions.pages
                    .flatMap((page) => page.items)
                    .map((suggestion) => (
                        <VideoGridCard key={suggestion.id} data={suggestion} />
                    ))}
            </div>
            <InfiniteScroll
                isManual={isManual}
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
            />
        </>
    );
};

export const SuggestionsSectionSkeleton = () => {
    return (
        <>
            <div className="hidden space-y-3 md:block">
                {Array.from({ length: 6 }).map((_, i) => (
                    <VideoRowCardSkeleton key={i} size="compact" />
                ))}
            </div>
            <div className="block space-y-3 md:hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                    <VideoGridCardSkeleton key={i} />
                ))}
            </div>
        </>
    );
};

export const SuggestionsSection = ({ videoId, isManual }: Props) => {
    return (
        <ErrorBoundary fallback={<div>Failed to load suggestions</div>}>
            <Suspense fallback={<SuggestionsSectionSkeleton />}>
                <SuggestionsSectionSuspense
                    videoId={videoId}
                    isManual={isManual}
                />
            </Suspense>
        </ErrorBoundary>
    );
};

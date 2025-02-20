"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const VideoSection = () => {
    return (
        <ErrorBoundary fallback={<div>Failed to load video section</div>}>
            <Suspense fallback={<div>Loading video section...</div>}>
                <VideoSectionSuspense />
            </Suspense>
        </ErrorBoundary>
    );
};

export const VideoSectionSuspense = () => {
    const [data] = trpc.studio.getMany.useSuspenseInfiniteQuery(
        {
            limit: DEFAULT_LIMIT,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );
    return (
        <div className="whitespace-pre">{JSON.stringify(data, null, 2)}</div>
    );
};

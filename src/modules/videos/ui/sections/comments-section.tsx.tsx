"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { CommentForm } from "@/modules/comments/components/comment-form";
import { CommentItem } from "@/modules/comments/components/comment-item";
import { trpc } from "@/trpc/client";
import { Loader } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
    videoId: string;
};

export const CommentsSectionSuspense = ({ videoId }: Props) => {
    const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
        { videoId, limit: DEFAULT_LIMIT },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );

    return (
        <div className="mt-6">
            <div className="flex flex-col gap-6">
                <h1 className="text-xl font-bold">
                    {comments.pages[0].totalCount} Comments
                </h1>
                <CommentForm videoId={videoId} onSuccess={() => {}} />
                <div className="mt-2 flex flex-col gap-4">
                    {comments.pages
                        .flatMap((page) => page.items)
                        .map((comment) => (
                            <CommentItem key={comment.id} comment={comment} />
                        ))}
                    <InfiniteScroll
                        isManual
                        hasNextPage={query.hasNextPage}
                        isFetchingNextPage={query.isFetchingNextPage}
                        fetchNextPage={query.fetchNextPage}
                    />
                </div>
            </div>
        </div>
    );
};

export const CommentsSectionSkeleton = () => {
    return (
        <div className="mt-6 flex items-center justify-center">
            <Loader className="size-7 animate-spin text-muted-foreground" />
        </div>
    );
};

export const CommentsSection = ({ videoId }: Props) => {
    return (
        <ErrorBoundary fallback={<div>Failed to load comments section</div>}>
            <Suspense fallback={<CommentsSectionSkeleton />}>
                <CommentsSectionSuspense videoId={videoId} />
            </Suspense>
        </ErrorBoundary>
    );
};

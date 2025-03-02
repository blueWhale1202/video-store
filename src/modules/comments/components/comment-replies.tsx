import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { CornerDownRight, Loader } from "lucide-react";
import { CommentItem } from "./comment-item";

type Props = {
    parentId: string;
    videoId: string;
};

export const CommentRepliesSkeleton = () => {
    return (
        <div className="pl-4">
            <div className="mt-2 flex flex-col gap-4">
                <div className="flex items-center justify-center">
                    <Loader className="size-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        </div>
    );
};

export const CommentReplies = ({ parentId, videoId }: Props) => {
    const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
        trpc.comments.getMany.useInfiniteQuery(
            {
                limit: DEFAULT_LIMIT,
                videoId,
                parentId,
            },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        );

    if (isLoading) {
        return <CommentRepliesSkeleton />;
    }

    return (
        <div className="pl-14">
            <div className="mt-2 flex flex-col gap-4">
                {data?.pages
                    .flatMap((page) => page.items)
                    .map((comment) => (
                        <CommentItem
                            variant="reply"
                            key={comment.id}
                            comment={comment}
                        />
                    ))}
            </div>
            {hasNextPage && (
                <Button
                    variant="tertiary"
                    size="sm"
                    disabled={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                >
                    <CornerDownRight />
                    Show more replies
                </Button>
            )}
        </div>
    );
};

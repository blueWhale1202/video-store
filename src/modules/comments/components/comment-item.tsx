import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useAuth, useClerk } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import {
    ChevronDown,
    ChevronUp,
    MessageSquare,
    MoreVertical,
    ThumbsDown,
    ThumbsUp,
    Trash,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CommentsGetManyOutput } from "../types";
import { CommentForm } from "./comment-form";
import { CommentReplies } from "./comment-replies";

type Props = {
    comment: CommentsGetManyOutput["items"][number];
    variant?: "reply" | "comment";
};

export const CommentItem = ({ comment, variant = "comment" }: Props) => {
    const formattedDate = (date: Date) => {
        return formatDistanceToNow(date, { addSuffix: true });
    };

    const { userId: clerkUserId } = useAuth();
    const clerk = useClerk();

    const utils = trpc.useUtils();

    const remove = trpc.comments.remove.useMutation({
        onSuccess() {
            toast.success("Comment removed");
            utils.comments.getMany.invalidate({ videoId: comment.videoId });
        },
        onError(err) {
            toast.error("Something went wrong");
            console.error(err);
            if (err.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        },
    });

    const like = trpc.commentReactions.like.useMutation({
        onSuccess() {
            utils.comments.getMany.invalidate({ videoId: comment.videoId });
        },
        onError(err) {
            console.error(err);

            if (err.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        },
    });

    const dislike = trpc.commentReactions.dislike.useMutation({
        onSuccess() {
            utils.comments.getMany.invalidate({ videoId: comment.videoId });
        },
        onError(err) {
            console.error(err);

            if (err.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        },
    });

    const isPending = like.isPending || dislike.isPending || remove.isPending;

    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const [isRepliesOpen, setIsRepliesOpen] = useState(false);

    const showActions =
        variant === "comment" || clerkUserId === comment.user.clerkId;

    return (
        <div>
            <div className="flex gap-4">
                <Link href={`/users/${comment.userId}`}>
                    <UserAvatar
                        size={variant === "reply" ? "sm" : "lg"}
                        imageUrl={comment.user.imageUrl}
                        name={comment.user.name}
                    />
                </Link>
                <div className="min-w-0 flex-1">
                    <Link href={`/users/${comment.userId}`}>
                        <div className="mb-0.5 flex items-center gap-2">
                            <span className="pb-0.5 text-sm font-medium">
                                {comment.user.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {formattedDate(comment.updatedAt)}
                            </span>
                        </div>
                    </Link>
                    <p className="text-sm">{comment.value}</p>
                    <div className="mt-1 flex items-center gap-2">
                        <div className="flex items-center">
                            <Button
                                disabled={isPending}
                                variant="ghost"
                                size="icon"
                                onClick={() => like.mutate({ id: comment.id })}
                            >
                                <ThumbsUp
                                    className={cn(
                                        comment.viewerReactions === "like" &&
                                            "fill-black",
                                    )}
                                />
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                {comment.likedCount}
                            </span>
                            <Button
                                disabled={isPending}
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    dislike.mutate({ id: comment.id })
                                }
                            >
                                <ThumbsDown
                                    className={cn(
                                        comment.viewerReactions === "dislike" &&
                                            "fill-black",
                                    )}
                                />
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                {comment.dislikedCount}
                            </span>
                        </div>
                        {variant === "comment" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsReplyOpen(true)}
                            >
                                Reply
                            </Button>
                        )}
                    </div>
                </div>
                {showActions && (
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="size-8">
                                <MoreVertical />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {variant === "comment" && (
                                <DropdownMenuItem
                                    onClick={() => setIsReplyOpen(true)}
                                >
                                    <MessageSquare className="size-4" />
                                    Reply
                                </DropdownMenuItem>
                            )}
                            {comment.user.clerkId === clerkUserId && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        remove.mutate({ id: comment.id })
                                    }
                                >
                                    <Trash className="size-4" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
            {isReplyOpen && variant === "comment" && (
                <div className="mt-4 pl-14">
                    <CommentForm
                        variant="reply"
                        parentId={comment.id}
                        videoId={comment.videoId}
                        onSuccess={() => {
                            setIsReplyOpen(false);
                            setIsRepliesOpen(true);
                        }}
                        onCancel={() => setIsReplyOpen(false)}
                    />
                </div>
            )}
            {comment.replyCount > 0 && variant === "comment" && (
                <div className="pl-14">
                    <Button
                        size="sm"
                        variant="tertiary"
                        onClick={() => setIsRepliesOpen((prev) => !prev)}
                    >
                        {isRepliesOpen ? <ChevronUp /> : <ChevronDown />}
                        {comment.replyCount} replies
                    </Button>
                </div>
            )}
            {comment.replyCount > 0 &&
                variant === "comment" &&
                isRepliesOpen && (
                    <CommentReplies
                        parentId={comment.id}
                        videoId={comment.videoId}
                    />
                )}
        </div>
    );
};

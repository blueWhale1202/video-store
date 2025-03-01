import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { VideoGetOneOutput } from "../../types";

type Props = {
    videoId: string;
    likes: number;
    dislikes: number;
    viewerReaction: VideoGetOneOutput["viewerReaction"];
};
export const VideoReactions = ({
    videoId,
    likes,
    dislikes,
    viewerReaction,
}: Props) => {
    const clerk = useClerk();
    const utils = trpc.useUtils();

    const like = trpc.videoReactions.like.useMutation({
        onSuccess() {
            utils.videos.getOne.invalidate({ id: videoId });
        },
        onError(err) {
            toast.error("Something went wrong");
            if (err.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        },
    });
    const dislike = trpc.videoReactions.dislike.useMutation({
        onSuccess() {
            utils.videos.getOne.invalidate({ id: videoId });
        },
        onError(err) {
            toast.error("Something went wrong");
            if (err.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        },
    });

    const isPending = like.isPending || dislike.isPending;

    return (
        <div className="flex flex-none items-center">
            <Button
                variant="secondary"
                className="gap-2 rounded-l-full rounded-r-none pr-4"
                onClick={() => like.mutate({ id: videoId })}
                disabled={isPending}
            >
                <ThumbsUp
                    className={cn(
                        "size-5",
                        viewerReaction === "like" && "fill-black",
                    )}
                />
                {likes}
            </Button>
            <Separator orientation="vertical" className="h-7" />
            <Button
                variant="secondary"
                className="gap-2 rounded-l-none rounded-r-full pl-3"
                onClick={() => dislike.mutate({ id: videoId })}
                disabled={isPending}
            >
                <ThumbsDown
                    className={cn(
                        "size-5",
                        viewerReaction === "dislike" && "fill-black",
                    )}
                />
                {dislikes}
            </Button>
        </div>
    );
};

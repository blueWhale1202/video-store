import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

type Props = {
    creatorId: string;
    isSubscribed: boolean;
    fromVideoId?: string;
};

export const useSubscription = ({
    creatorId,
    isSubscribed,
    fromVideoId,
}: Props) => {
    const clerk = useClerk();
    const utils = trpc.useUtils();

    const subscribe = trpc.subscriptions.create.useMutation({
        onSuccess() {
            toast.success("Subscribed!");
            utils.videos.getManySubscribed.invalidate();

            if (fromVideoId) {
                utils.videos.getOne.invalidate({ id: fromVideoId });
            }
        },
        onError(error) {
            toast.error("Something went wrong. Please try again.");
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        },
    });
    const unsubscribe = trpc.subscriptions.remove.useMutation({
        onSuccess() {
            toast.success("Subscribed!");

            if (fromVideoId) {
                utils.videos.getOne.invalidate({ id: fromVideoId });
            }
        },
        onError(error) {
            toast.error("Something went wrong. Please try again.");
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        },
    });

    const isPending = subscribe.isPending || unsubscribe.isPending;

    const onClick = () => {
        if (isSubscribed) {
            unsubscribe.mutate({ creatorId });
        } else {
            subscribe.mutate({ creatorId });
        }
    };

    return {
        isPending,
        onClick,
    };
};

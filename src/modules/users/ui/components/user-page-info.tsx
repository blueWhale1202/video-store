import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { useAuth, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { UserGetOneOutput } from "../../types";

type Props = {
    user: UserGetOneOutput;
};

export const UserPageInfo = ({ user }: Props) => {
    const { userId: clerkUserId, isLoaded } = useAuth();
    const clerk = useClerk();

    const { isPending, onClick: onSubscription } = useSubscription({
        creatorId: user.id,
        isSubscribed: user.viewerSubscribed,
    });

    const onClick = () => {
        if (user.clerkId === clerkUserId) {
            clerk.openUserProfile();
        }
    };

    return (
        <div className="py-6">
            <div className="flex flex-col md:hidden">
                <div className="flex items-center gap-3">
                    <UserAvatar
                        size="lg"
                        imageUrl={user.imageUrl}
                        name={user.name}
                        className="h-[60px] w-[60px]"
                        onClick={onClick}
                    />
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl font-bold">{user.name}</h1>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{user.subscriberCount} subscribers</span>
                            <span>&bull;</span>
                            <span>{user.videoCount} videos</span>
                        </div>
                    </div>
                </div>
                {user.clerkId === clerkUserId ? (
                    <Button
                        asChild
                        variant="secondary"
                        className="mt-3 w-full rounded-full"
                    >
                        <Link prefetch href="/studio">
                            Go to Studio
                        </Link>
                    </Button>
                ) : (
                    <SubscriptionButton
                        disabled={isPending || !isLoaded}
                        isSubscribed={user.viewerSubscribed}
                        onClick={onSubscription}
                        className="mt-3 w-full"
                    />
                )}
            </div>
            <div className="hidden items-start gap-4 md:flex">
                <UserAvatar
                    size="xl"
                    imageUrl={user.imageUrl}
                    name={user.name}
                    className={cn(
                        clerkUserId === user.clerkId &&
                            "cursor-pointer transition-opacity duration-300 hover:opacity-80",
                    )}
                    onClick={onClick}
                />
                <div className="min-w-0 flex-1">
                    <h1 className="text-4xl font-bold">{user.name}</h1>
                    <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                        <span>{user.subscriberCount} subscribers</span>
                        <span>&bull;</span>
                        <span>{user.videoCount} videos</span>
                    </div>
                    {user.clerkId === clerkUserId ? (
                        <Button
                            asChild
                            variant="secondary"
                            className="mt-3 rounded-full"
                        >
                            <Link prefetch href="/studio">
                                Go to Studio
                            </Link>
                        </Button>
                    ) : (
                        <SubscriptionButton
                            disabled={isPending || !isLoaded}
                            isSubscribed={user.viewerSubscribed}
                            onClick={onSubscription}
                            className="mt-3"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export const UserPageInfoSkeleton = () => {
    return (
        <div className="py-6">
            <div className="flex flex-col md:hidden">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-[60px] w-[60px] rounded-full" />
                    <div className="min-w-0 flex-1">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="mt-1 h-4 w-48" />
                    </div>
                </div>
                <Skeleton className="mt-3 h-10 w-full rounded-full" />
            </div>
            <div className="hidden items-start gap-4 md:flex">
                <Skeleton className="size-40 rounded-full" />
                <div className="min-w-0 flex-1">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="mt-4 h-5 w-48" />
                    <Skeleton className="mt-3 h-10 w-32 rounded-full" />
                </div>
            </div>
        </div>
    );
};

"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import {
    SubscriptionItem,
    SubscriptionItemSkeleton,
} from "../ui/components/subscription-item";

export const SubscriptionsSectionSuspense = () => {
    const utils = trpc.useUtils();
    const [subscriptions, query] =
        trpc.subscriptions.getMany.useSuspenseInfiniteQuery(
            {
                limit: DEFAULT_LIMIT,
            },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
            },
        );

    const unsubscribe = trpc.subscriptions.remove.useMutation({
        onSuccess(data) {
            toast.success("Unsubscribed successfully.");
            utils.videos.getManySubscribed.invalidate();
            utils.users.getOne.invalidate({ id: data.creatorId });
            utils.subscriptions.getMany.invalidate();
        },
        onError(error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        },
    });

    return (
        <>
            <div className="flex flex-col gap-4">
                {subscriptions.pages
                    .flatMap((page) => page.items)
                    .map((subscription) => (
                        <Link
                            prefetch
                            href={`/users/${subscription.user.id}`}
                            key={subscription.user.id}
                        >
                            <SubscriptionItem
                                name={subscription.user.name}
                                imageUrl={subscription.user.imageUrl}
                                subscriberCount={
                                    subscription.user.subscriberCount
                                }
                                onUnsubscribe={() => {
                                    unsubscribe.mutate({
                                        creatorId: subscription.creatorId,
                                    });
                                }}
                                disabled={unsubscribe.isPending}
                            />
                        </Link>
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

export const SubscriptionsSectionSkeleton = () => {
    return (
        <div className="flex flex-col gap-4">
            {Array.from({ length: 18 }).map((_, index) => (
                <SubscriptionItemSkeleton key={index} />
            ))}
        </div>
    );
};

export const SubscriptionsSection = () => {
    return (
        <ErrorBoundary fallback={<div>Error</div>}>
            <Suspense fallback={<SubscriptionsSectionSkeleton />}>
                <SubscriptionsSectionSuspense />
            </Suspense>
        </ErrorBoundary>
    );
};

"use client";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { ListIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const SubscriptionsSectionSkeleton = () => {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {[...Array(5)].map((_, index) => (
                        <SidebarMenuItem key={index}>
                            <SidebarMenuButton disabled>
                                <Skeleton className="size-6 shrink-0 rounded-full" />
                                <Skeleton className="h-4 w-full" />
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
};

export const SubscriptionsSection = () => {
    const pathname = usePathname();

    const { data, isLoading } = trpc.subscriptions.getMany.useInfiniteQuery(
        { limit: DEFAULT_LIMIT },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );

    if (isLoading) {
        return <SubscriptionsSectionSkeleton />;
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {data?.pages
                        .flatMap((page) => page.items)
                        .map((subscription) => (
                            <SidebarMenuItem
                                key={`${subscription.creatorId}-${subscription.viewerId}`}
                            >
                                <SidebarMenuButton
                                    asChild
                                    tooltip={subscription.user.name}
                                    isActive={
                                        pathname ===
                                        `/users/${subscription.user.id}`
                                    }
                                >
                                    <Link
                                        prefetch
                                        href={`/users/${subscription.user.id}`}
                                        className="flex items-center gap-2"
                                    >
                                        <UserAvatar
                                            size="xs"
                                            imageUrl={
                                                subscription.user.imageUrl
                                            }
                                            name={subscription.user.name}
                                        />
                                        <span className="text-sm">
                                            {subscription.user.name}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === "/subscriptions"}
                        >
                            <Link
                                prefetch
                                href="/subscriptions"
                                className="flex items-center gap-2"
                            >
                                <ListIcon className="size-4" />
                                <span className="text-sm">
                                    All subscriptions
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
};

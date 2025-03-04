"use client";

import { Separator } from "@/components/ui/separator";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
    UserPageBanner,
    UserPageBannerSkeleton,
} from "../ui/components/user-page-banner";
import {
    UserPageInfo,
    UserPageInfoSkeleton,
} from "../ui/components/user-page-info";

type Props = {
    userId: string;
};

export const UserSectionSuspense = ({ userId }: Props) => {
    const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId });

    return (
        <div className="flex flex-col">
            <UserPageBanner user={user} />
            <UserPageInfo user={user} />
            <Separator />
        </div>
    );
};

export const UserSectionSkeleton = () => {
    return (
        <div className="flex flex-col">
            <UserPageBannerSkeleton />
            <UserPageInfoSkeleton />
        </div>
    );
};

export const UserSection = ({ userId }: Props) => {
    return (
        <ErrorBoundary fallback={<div>Error</div>}>
            <Suspense fallback={<UserSectionSkeleton />}>
                <UserSectionSuspense userId={userId} />
            </Suspense>
        </ErrorBoundary>
    );
};

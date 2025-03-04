import {
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export const StudioSidebarHeader = () => {
    const { user } = useUser();
    const { state } = useSidebar();

    if (!user) {
        return (
            <SidebarHeader className="flex items-center justify-center pb-4">
                <Skeleton className="size-[112px] rounded-full" />
                <div className="mt-2 flex flex-col items-center gap-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-[100px]" />
                </div>
            </SidebarHeader>
        );
    }

    if (state === "collapsed") {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Your profile" asChild>
                        <Link
                            prefetch
                            href="/users/current"
                            className="mx-auto mt-2 flex items-center justify-center"
                        >
                            <UserAvatar
                                imageUrl={user.imageUrl}
                                name={user.fullName ?? "User"}
                                size="sm"
                            />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }
    return (
        <SidebarHeader className="flex items-center justify-center pb-4">
            <Link prefetch href="/users/current">
                <UserAvatar
                    imageUrl={user.imageUrl}
                    name={user.fullName ?? "User"}
                    className="size-[112px] transition-opacity hover:opacity-80"
                />
            </Link>

            <div className="mt-2 flex flex-col items-center gap-y-1">
                <p className="text-sm font-medium">Your profile</p>
                <p className="text-xs text-muted-foreground">
                    {user.fullName ?? "User"}
                </p>
            </div>
        </SidebarHeader>
    );
};

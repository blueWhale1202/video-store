"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogOutIcon, VideoIcon } from "lucide-react";
import { StudioSidebarHeader } from "./studio-sidebar-header";

export const StudioSidebar = () => {
    const pathname = usePathname();

    return (
        <Sidebar className="z-40 pt-16" collapsible="icon">
            <StudioSidebarHeader />
            <SidebarContent className="bg-background">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip="Content"
                                    isActive={pathname === "/studio"}
                                    asChild
                                >
                                    <Link prefetch href="/studio">
                                        <VideoIcon className="size-5" />
                                        <span className="text-sm">Content</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <Separator />
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip="Exit Studio"
                                    asChild
                                >
                                    <Link prefetch href="/">
                                        <LogOutIcon className="size-5" />
                                        <span className="text-sm">
                                            Exit studio
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};

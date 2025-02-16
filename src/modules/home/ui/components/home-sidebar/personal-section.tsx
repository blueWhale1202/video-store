"use client";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth, useClerk } from "@clerk/nextjs";
import { HistoryIcon, ListVideo, LucideIcon, ThumbsUp } from "lucide-react";
import Link from "next/link";

type Item = {
    title: string;
    url: string;
    icon: LucideIcon;
    auth?: boolean;
};

const items: Item[] = [
    {
        title: "History",
        url: "/playlist/history",
        icon: HistoryIcon,
        auth: true,
    },
    {
        title: "Liked Videos",
        url: "/playlist/liked",
        icon: ThumbsUp,
        auth: true,
    },
    {
        title: "All playlists",
        url: "/playlist",
        icon: ListVideo,
        auth: true,
    },
];

export const PersonalSection = () => {
    const { isSignedIn } = useAuth();
    const clerk = useClerk();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>You</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.url}>
                            <SidebarMenuButton
                                tooltip={item.title}
                                isActive={false}
                                onClick={(e) => {
                                    if (!isSignedIn && item.auth) {
                                        e.preventDefault();
                                        clerk.openSignIn();
                                    }
                                }}
                                asChild
                            >
                                <Link
                                    href={item.url}
                                    className="flex items-center gap-4"
                                >
                                    <item.icon />
                                    <span className="text-sm">
                                        {item.title}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
};

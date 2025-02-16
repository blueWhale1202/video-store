"use client";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
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
                                onClick={() => {}}
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

"use client";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth, useClerk } from "@clerk/nextjs";
import { FlameIcon, HomeIcon, LucideIcon, PlaySquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
    title: string;
    url: string;
    icon: LucideIcon;
    auth?: boolean;
};

const items: Item[] = [
    {
        title: "Home",
        url: "/",
        icon: HomeIcon,
    },
    {
        title: "Subscriptions",
        url: "/feed/subscribed",
        icon: PlaySquare,
        auth: true,
    },
    {
        title: "Trending",
        url: "/feed/trending",
        icon: FlameIcon,
    },
];

export const MainSection = () => {
    const clerk = useClerk();
    const { isSignedIn } = useAuth();
    const pathname = usePathname();

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.url}>
                            <SidebarMenuButton
                                tooltip={item.title}
                                isActive={pathname === item.url}
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

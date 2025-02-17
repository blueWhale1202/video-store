import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { TRPCProvider } from "@/trpc/client";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Create Next App",
    description: "Generated by create next app",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider afterSignOutUrl="/">
            <html lang="en">
                <body className={inter.className}>
                    <TRPCProvider>{children}</TRPCProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}

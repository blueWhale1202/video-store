"use client";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const VideoSection = () => {
    return (
        <ErrorBoundary fallback={<div>Failed to load video section</div>}>
            <Suspense fallback={<div>Loading video section...</div>}>
                <VideoSectionSuspense />
            </Suspense>
        </ErrorBoundary>
    );
};

export const VideoSectionSuspense = () => {
    const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
        {
            limit: DEFAULT_LIMIT,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    );
    return (
        <div>
            <div className="border-y">
                <Table>
                    <TableCaption>A list of your recent invoices.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[510px] pl-6">
                                Video
                            </TableHead>
                            <TableHead>Visibility</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Views</TableHead>
                            <TableHead className="text-right">
                                Comments
                            </TableHead>
                            <TableHead className="pr-6 text-right">
                                Likes
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {videos.pages
                            .flatMap((page) => page.items)
                            .map((video) => (
                                <Link
                                    key={video.id}
                                    href={`/studio/videos/${video.id}`}
                                    legacyBehavior
                                >
                                    <TableRow className="cursor-pointer">
                                        <TableCell>{video.title}</TableCell>
                                    </TableRow>
                                </Link>
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

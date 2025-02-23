"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DEFAULT_LIMIT } from "@/constants";
import { snakeToTitle } from "@/lib/utils";
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail";
import { trpc } from "@/trpc/client";
import { format } from "date-fns";
import { Globe2, Lock } from "lucide-react";
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
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="relative aspect-video w-36 shrink-0">
                                                    <VideoThumbnail
                                                        imageUrl={
                                                            video.thumbnailUrl
                                                        }
                                                        previewUrl={
                                                            video.previewUrl
                                                        }
                                                        title="Title"
                                                        duration={
                                                            video.duration
                                                        }
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-y-1 overflow-hidden">
                                                    <span className="line-clamp-1 text-sm">
                                                        {video.title}
                                                    </span>
                                                    <span className="line-clamp-1 text-xs text-muted-foreground">
                                                        {video.description ||
                                                            "No description"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                {video.visibility ===
                                                "private" ? (
                                                    <Lock className="mr-2 size-4" />
                                                ) : (
                                                    <Globe2 className="mr-2 size-4" />
                                                )}
                                                {snakeToTitle(video.visibility)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                {snakeToTitle(
                                                    video.muxStatus ?? "error",
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="truncate text-sm">
                                            {format(
                                                new Date(video.createAt),
                                                "d MMM yyyy",
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </Link>
                            ))}
                    </TableBody>
                </Table>
            </div>
            <InfiniteScroll
                isManual
                hasNextPage={!!query.hasNextPage}
                fetchNextPage={query.fetchNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
            />
        </div>
    );
};

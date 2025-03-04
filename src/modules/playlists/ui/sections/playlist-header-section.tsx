"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

type Props = {
    playlistId: string;
};

export const PlaylistHeaderSectionSuspense = ({ playlistId }: Props) => {
    const router = useRouter();

    const [playlist] = trpc.playlists.getOne.useSuspenseQuery({
        id: playlistId,
    });

    const utils = trpc.useUtils();
    const remove = trpc.playlists.remove.useMutation({
        onSuccess() {
            toast.success("Playlist removed");
            utils.playlists.getMany.invalidate();
            router.push("/playlists");
        },
        onError(err) {
            console.error(err);
            toast.error("Something went wrong");
        },
    });

    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-xl font-bold">{playlist.name}</h1>
                <p className="text-xs text-muted-foreground">
                    Videos from the playlist
                </p>
            </div>
            <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                disabled={remove.isPending}
                onClick={() => remove.mutate({ id: playlistId })}
            >
                <Trash />
            </Button>
        </div>
    );
};

export const PlaylistHeaderSectionSkeleton = () => {
    return (
        <div className="flex flex-col gap-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
        </div>
    );
};

export const PlaylistHeaderSection = ({ playlistId }: Props) => {
    return (
        <ErrorBoundary fallback={<div>Error</div>}>
            <Suspense fallback={<PlaylistHeaderSectionSkeleton />}>
                <PlaylistHeaderSectionSuspense playlistId={playlistId} />
            </Suspense>
        </ErrorBoundary>
    );
};

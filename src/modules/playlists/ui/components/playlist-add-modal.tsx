import { InfiniteScroll } from "@/components/infinite-scroll";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Loader, Square, SquareCheckBig } from "lucide-react";
import { toast } from "sonner";

type Props = {
    videoId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const PlaylistAddModal = ({ open, onOpenChange, videoId }: Props) => {
    const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
        trpc.playlists.getManyForVideo.useInfiniteQuery(
            {
                limit: DEFAULT_LIMIT,
                videoId,
            },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
                enabled: !!videoId && open,
            },
        );

    const utils = trpc.useUtils();

    const addVideo = trpc.playlists.addVideo.useMutation({
        onSuccess(data) {
            toast.success("Video added to playlist");
            utils.playlists.getMany.invalidate();
            utils.playlists.getManyForVideo.invalidate({ videoId });
            utils.playlists.getOne.invalidate({ id: data.playlistId });
            utils.playlists.getVideos.invalidate({
                playlistId: data.playlistId,
            });
        },
        onError(error) {
            console.error(error);
            toast.error("Something went wrong");
        },
    });

    const removeVideo = trpc.playlists.removeVideo.useMutation({
        onSuccess(data) {
            toast.success("Video removed from playlist");
            utils.playlists.getMany.invalidate();
            utils.playlists.getManyForVideo.invalidate({ videoId });
            utils.playlists.getOne.invalidate({ id: data.playlistId });
            utils.playlists.getVideos.invalidate({
                playlistId: data.playlistId,
            });
        },
        onError(error) {
            console.error(error);
            toast.error("Something went wrong");
        },
    });

    const isPending = addVideo.isPending || removeVideo.isPending;

    const onClick = (playlistId: string, containsVideo: boolean) => {
        if (containsVideo) {
            removeVideo.mutate({ playlistId, videoId });
        } else {
            addVideo.mutate({ playlistId, videoId });
        }
    };

    return (
        <ResponsiveDialog
            title="Add to Playlist"
            open={open}
            onOpenChange={onOpenChange}
        >
            <div className="flex flex-col gap-2">
                {isLoading ? (
                    <Loader className="mx-auto size-5 animate-spin text-muted-foreground" />
                ) : (
                    <>
                        {data?.pages
                            .flatMap((page) => page.items)
                            .map((playlist) => (
                                <Button
                                    key={playlist.id}
                                    variant="ghost"
                                    size="lg"
                                    className="w-full justify-start px-2 [&_svg]:size-5"
                                    disabled={isPending}
                                    onClick={() =>
                                        onClick(
                                            playlist.id,
                                            playlist.containsVideo,
                                        )
                                    }
                                >
                                    {playlist.containsVideo ? (
                                        <SquareCheckBig />
                                    ) : (
                                        <Square />
                                    )}
                                    {playlist.name}
                                </Button>
                            ))}
                        <InfiniteScroll
                            isManual
                            hasNextPage={hasNextPage}
                            isFetchingNextPage={isFetchingNextPage}
                            fetchNextPage={fetchNextPage}
                        />
                    </>
                )}
            </div>
        </ResponsiveDialog>
    );
};

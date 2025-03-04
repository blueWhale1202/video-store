import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getVideoUrl } from "@/lib/utils";
import { PlaylistAddModal } from "@/modules/playlists/ui/components/playlist-add-modal";
import { ListPlus, MoreVertical, ShareIcon, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
    videoId: string;
    variant?: "ghost" | "secondary";
    onRemove?: () => void;
};

export const VideoMenu = ({ videoId, variant = "ghost", onRemove }: Props) => {
    const [openPlaylistAdd, setOpenPlaylistAdd] = useState(false);

    const onShare = () => {
        const fullUrl = getVideoUrl(videoId);
        navigator.clipboard.writeText(fullUrl);
        toast.success("Link copied to clipboard");
    };

    return (
        <>
            <PlaylistAddModal
                open={openPlaylistAdd}
                onOpenChange={setOpenPlaylistAdd}
                videoId={videoId}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={variant}
                        size="icon"
                        className="rounded-full"
                    >
                        <MoreVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()}
                >
                    <DropdownMenuItem onClick={onShare}>
                        <ShareIcon className="mr-2 size-4" />
                        Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOpenPlaylistAdd(true)}>
                        <ListPlus className="mr-2 size-4" />
                        Add to playlist
                    </DropdownMenuItem>
                    {onRemove && (
                        <DropdownMenuItem onClick={onRemove}>
                            <Trash className="mr-2 size-4" />
                            Remove
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

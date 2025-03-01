import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getVideoUrl } from "@/lib/utils";
import { ListPlus, MoreVertical, ShareIcon, Trash } from "lucide-react";
import { toast } from "sonner";

type Props = {
    videoId: string;
    variant?: "ghost" | "secondary";
    onRemove?: () => void;
};

export const VideoMenu = ({
    videoId,
    variant = "secondary",
    onRemove,
}: Props) => {
    const onShare = () => {
        const fullUrl = getVideoUrl(videoId);
        navigator.clipboard.writeText(fullUrl);
        toast.success("Link copied to clipboard");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size="icon" className="rounded-full">
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
                <DropdownMenuItem onClick={() => {}}>
                    <ListPlus className="mr-2 size-4" />
                    Add to playlist
                </DropdownMenuItem>
                {onRemove && (
                    <DropdownMenuItem onClick={() => {}}>
                        <Trash className="mr-2 size-4" />
                        Remove
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

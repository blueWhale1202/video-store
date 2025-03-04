import { PlaylistGetManyOutput } from "@/modules/playlists/types";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import Link from "next/link";
import { PlaylistInfo, PlaylistInfoSkeleton } from "./playlist-info";
import {
    PlaylistThumbnail,
    PlaylistThumbnailSkeleton,
} from "./playlist-thumbnail";

type Props = {
    data: PlaylistGetManyOutput["items"][number];
};

export const PlaylistGridCard = ({ data }: Props) => {
    return (
        <Link href={`/playlists/${data.id}`}>
            <div className="group flex w-full flex-col gap-2">
                <PlaylistThumbnail
                    imageUrl={data.thumbnailURl || THUMBNAIL_FALLBACK}
                    title={data.name}
                    videoCount={data.videoCount}
                />
                <PlaylistInfo data={data} />
            </div>
        </Link>
    );
};

export const PlaylistGridCardSkeleton = () => {
    return (
        <div className="flex w-full flex-col gap-2">
            <PlaylistThumbnailSkeleton />
            <PlaylistInfoSkeleton />
        </div>
    );
};

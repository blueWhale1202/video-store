import { PlaylistHeaderSection } from "../sections/playlist-header-section";
import { VideosSection } from "../sections/videos-section";

type Props = {
    playlistId: string;
};

export const VideosView = ({ playlistId }: Props) => {
    return (
        <div className="mx-auto mb-10 flex max-w-screen-md flex-col gap-y-6 px-4 pt-2.5">
            <PlaylistHeaderSection playlistId={playlistId} />
            <VideosSection playlistId={playlistId} />
        </div>
    );
};

import { DEFAULT_LIMIT } from "@/constants";
import { LikedView } from "@/modules/playlists/ui/views/liked-view";
import { HydrateClient, trpc } from "@/trpc/server";

export default async function LikedPage() {
    void trpc.playlists.getHistory.prefetchInfinite({
        limit: DEFAULT_LIMIT,
    });

    return (
        <HydrateClient>
            <LikedView />
        </HydrateClient>
    );
}

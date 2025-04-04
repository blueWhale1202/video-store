import { DEFAULT_LIMIT } from "@/constants";
import { TrendingView } from "@/modules/home/ui/views/trending-views";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function TrendingPage() {
    void trpc.videos.getManyTrending.prefetchInfinite({ limit: DEFAULT_LIMIT });
    return (
        <HydrateClient>
            <TrendingView />
        </HydrateClient>
    );
}

import { DEFAULT_LIMIT } from "@/constants";
import { SubscribedView } from "@/modules/home/ui/views/subscribed-vew";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function SubscribedPage() {
    void trpc.videos.getManySubscribed.prefetchInfinite({
        limit: DEFAULT_LIMIT,
    });
    return (
        <HydrateClient>
            <SubscribedView />
        </HydrateClient>
    );
}

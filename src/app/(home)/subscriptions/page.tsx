import { SubscriptionsView } from "@/modules/subscriptions/views/subscriptions-view";
import { HydrateClient, trpc } from "@/trpc/server";

export default async function SubscriptionsPage() {
    void trpc.subscriptions.getMany.prefetchInfinite({
        limit: 10,
    });

    return (
        <HydrateClient>
            <SubscriptionsView />
        </HydrateClient>
    );
}

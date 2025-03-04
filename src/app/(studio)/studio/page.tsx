import { StudioView } from "@/modules/studio/views/studio-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
    void trpc.studio.getMany.prefetchInfinite({
        limit: 5,
    });

    return (
        <HydrateClient>
            <StudioView />
        </HydrateClient>
    );
}

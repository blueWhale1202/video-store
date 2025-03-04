import { DEFAULT_LIMIT } from "@/constants";
import { HomeView } from "@/modules/home/ui/views/home-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

type Props = {
    searchParams: Promise<{
        categoryId?: string;
    }>;
};

export default async function Page({ searchParams }: Props) {
    const { categoryId } = await searchParams;

    void trpc.categories.getMany.prefetch();
    void trpc.videos.getMany.prefetchInfinite({
        categoryId,
        limit: DEFAULT_LIMIT,
    });

    return (
        <HydrateClient>
            <HomeView categoryId={categoryId} />
        </HydrateClient>
    );
}

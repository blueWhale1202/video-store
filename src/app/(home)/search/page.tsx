import { DEFAULT_LIMIT } from "@/constants";
import { SearchView } from "@/modules/search/ui/views/search-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

type Props = {
    searchParams: Promise<{
        query?: string;
        categoryId?: string;
    }>;
};

export default async function SearchPage({ searchParams }: Props) {
    const { query, categoryId } = await searchParams;

    void trpc.categories.getMany.prefetch();
    void trpc.search.getMany.prefetchInfinite({
        query,
        categoryId,
        limit: DEFAULT_LIMIT,
    });

    return (
        <HydrateClient>
            <SearchView query={query} categoryId={categoryId} />
        </HydrateClient>
    );
}

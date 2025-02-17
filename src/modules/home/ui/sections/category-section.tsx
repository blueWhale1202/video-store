"use client";

import { FilterCarousel } from "@/components/filter-carousel";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
    categoryId?: string;
};

const CategorySectionSuspense = ({ categoryId }: Props) => {
    const [categories] = trpc.categories.getMany.useSuspenseQuery();
    const router = useRouter();

    const data = categories.map((category) => ({
        value: category.id,
        label: category.name,
    }));

    const onSelect = (value: string | null) => {
        const url = new URL(window.location.href);
        if (value) {
            url.searchParams.set("categoryId", value);
        } else {
            url.searchParams.delete("categoryId");
        }

        router.push(url.toString());
    };

    return (
        <FilterCarousel
            isLoading={false}
            data={data}
            value={categoryId}
            onSelect={onSelect}
        />
    );
};

const CategorySkeleton = () => {
    return <FilterCarousel isLoading data={[]} />;
};

export const CategorySection = ({ categoryId }: Props) => {
    return (
        <Suspense fallback={<CategorySkeleton />}>
            <ErrorBoundary fallback={<div>Error</div>}>
                <CategorySectionSuspense categoryId={categoryId} />
            </ErrorBoundary>
        </Suspense>
    );
};

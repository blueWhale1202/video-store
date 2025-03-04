"use client";

import { FilterCarousel } from "@/components/filter-carousel";
import { trpc } from "@/trpc/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
    categoryId?: string;
};

const CategorySectionSuspense = ({ categoryId }: Props) => {
    const [categories] = trpc.categories.getMany.useSuspenseQuery();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const data = categories.map((category) => ({
        value: category.id,
        label: category.name,
    }));

    const onSelect = (value: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set("categoryId", value);
        } else {
            params.delete("categoryId");
        }

        router.push(`${pathname}?${params.toString()}`);
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

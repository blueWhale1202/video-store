import { CategorySection } from "../sections/category-section";
import { ResultsSection } from "../sections/results-section";

type Props = {
    query?: string;
    categoryId?: string;
};

export const SearchView = ({ query, categoryId }: Props) => {
    return (
        <div className="mx-auto mb-10 flex max-w-[1300px] flex-col gap-y-6 px-4 pt-2.5">
            <CategorySection categoryId={categoryId} />
            <ResultsSection categoryId={categoryId} query={query} />
        </div>
    );
};

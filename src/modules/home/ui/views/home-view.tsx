import { CategorySection } from "../sections/category-section";
import { HomeVideosSection } from "../sections/home-videos-section";

type Props = {
    categoryId?: string;
};

export const HomeView = ({ categoryId }: Props) => {
    return (
        <div className="mx-auto mb-10 flex max-w-[2400px] flex-col gap-y-6 px-4 pt-2.5">
            <CategorySection categoryId={categoryId} />
            <HomeVideosSection />
        </div>
    );
};

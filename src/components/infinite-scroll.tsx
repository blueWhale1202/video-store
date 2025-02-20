import { useInView } from "react-intersection-observer";

type Props = {
    isManual?: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
};

export const InfiniteScroll = ({
    isManual = false,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
}: Props) => {
    const { ref, inView } = useInView({
        threshold: 0.5,
        rootMargin: "100px",
    });
    return <div></div>;
};

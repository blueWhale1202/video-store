import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "./ui/button";

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

    useEffect(() => {
        if (!isManual && inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, isManual]);

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div ref={ref} className="h-1" />
            {hasNextPage ? (
                <Button
                    variant="secondary"
                    disabled={!hasNextPage || isFetchingNextPage}
                    onClick={fetchNextPage}
                >
                    {isFetchingNextPage ? "Loading..." : "Load More"}
                </Button>
            ) : (
                <p className="text-xs text-muted-foreground">
                    You have reached the end of the list
                </p>
            )}
        </div>
    );
};

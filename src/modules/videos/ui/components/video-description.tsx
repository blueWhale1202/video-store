import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type Props = {
    compactViews: string;
    expandedViews: string;
    compactDate: string;
    expandedDate: string;
    description?: string | null;
};

export const VideoDescription = ({
    compactViews,
    expandedViews,
    compactDate,
    expandedDate,
    description,
}: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="cursor-pointer rounded-xl bg-secondary/50 p-3 transition hover:bg-secondary/70"
        >
            <div className="mb-2 flex gap-2 text-sm">
                <span className="font-medium">
                    {isExpanded ? expandedViews : compactViews} views
                </span>
                <span className="font-medium">
                    {isExpanded ? expandedDate : compactDate}
                </span>
            </div>
            <div className="relative">
                <p
                    className={cn(
                        "whitespace-pre-wrap text-sm",
                        !isExpanded && "line-clamp-2",
                    )}
                >
                    {description || "No description"}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium">
                    {isExpanded ? (
                        <>
                            Show less <ChevronUp className="size-4" />
                        </>
                    ) : (
                        <>
                            Show more <ChevronDown className="size-4" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

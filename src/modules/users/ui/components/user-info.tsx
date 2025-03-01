import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

const userInfoVariants = cva("flex items-center gap-1", {
    variants: {
        size: {
            default: "[&_p]:text-sm [&_svg]:size-4",
            lg: "[&_p]:text-base [&_p]:font-medium [&_p]:text-black [&_svg]:size-5",
            sm: "[&_p]:text-xs [&_svg]:size-3.5",
        },
    },
    defaultVariants: {
        size: "default",
    },
});

interface Props extends VariantProps<typeof userInfoVariants> {
    name: string;
    className?: HTMLDivElement["className"];
}

export const UserInfo = ({ name, className, size }: Props) => {
    return (
        <div className={cn(userInfoVariants({ size, className }))}>
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <p className="line-clamp-1 text-gray-500 hover:text-gray-800">
                            {name}
                        </p>
                    </TooltipTrigger>
                    <TooltipContent align="center" className="bg-black/70">
                        <p>{name}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

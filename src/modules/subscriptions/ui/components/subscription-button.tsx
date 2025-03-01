import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
    onClick: ButtonProps["onClick"];
    disabled: boolean;
    isSubscribed: boolean;
    className?: ButtonProps["className"];
    size?: ButtonProps["size"];
};

export const SubscriptionButton = ({
    onClick,
    disabled,
    isSubscribed,
    className,
    size,
}: Props) => {
    return (
        <Button
            size={size}
            variant={isSubscribed ? "secondary" : "default"}
            onClick={onClick}
            disabled={disabled}
            className={cn("rounded-full", className)}
        >
            {isSubscribed ? "Unsubscribe" : "Subscribe"}
        </Button>
    );
};

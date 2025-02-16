import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

export const AuthButton = () => {
    return (
        <Button
            variant="outline"
            className="rounded-full border-blue-500/20 px-4 py-2 text-sm font-medium text-blue-600 shadow-none hover:text-blue-500 [&_svg]:size-5"
        >
            <UserCircle />
            Sign In
        </Button>
    );
};

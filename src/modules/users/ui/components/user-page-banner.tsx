import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { Edit2 } from "lucide-react";
import { useState } from "react";
import { UserGetOneOutput } from "../../types";
import { BannerUploadModal } from "./banner-upload-modal";

type Props = {
    user: UserGetOneOutput;
};

export const UserPageBanner = ({ user }: Props) => {
    const { userId: clerkUserId } = useAuth();
    const [open, setOpen] = useState(false);

    return (
        <div className="group relative">
            <BannerUploadModal
                userId={user.id}
                open={open}
                onOpenChange={setOpen}
            />
            <div
                className={cn(
                    "h-[15vh] max-h-[200px] w-full rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 md:h-[25vh]",
                    user.bannerUrl ? "bg-cover bg-center" : "bg-gray-100",
                )}
                style={{
                    backgroundImage: user.bannerUrl
                        ? `url(${user.bannerUrl})`
                        : undefined,
                }}
            >
                {clerkUserId === user.clerkId && (
                    <Button
                        type="button"
                        size="icon"
                        className="absolute right-4 top-4 rounded-full bg-black/50 opacity-100 transition-opacity duration-300 hover:bg-black/50 group-hover:opacity-100 md:opacity-0"
                        onClick={() => setOpen(true)}
                    >
                        <Edit2 className="text-white" />
                    </Button>
                )}
            </div>
        </div>
    );
};

export const UserPageBannerSkeleton = () => {
    return <Skeleton className="h-[15vh] max-h-[200px] w-full md:h-[25vh]" />;
};

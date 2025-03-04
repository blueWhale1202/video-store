import { ResponsiveDialog } from "@/components/responsive-dialog";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";

type Props = {
    userId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const BannerUploadModal = ({ userId, open, onOpenChange }: Props) => {
    const utils = trpc.useUtils();

    const onUploadComplete = () => {
        utils.users.getOne.invalidate({ id: userId });
        onOpenChange(false);
    };

    return (
        <ResponsiveDialog
            title="Upload a new banner"
            open={open}
            onOpenChange={onOpenChange}
        >
            <UploadDropzone
                endpoint="bannerUploader"
                onClientUploadComplete={onUploadComplete}
                config={{
                    mode: "auto",
                }}
            />
        </ResponsiveDialog>
    );
};

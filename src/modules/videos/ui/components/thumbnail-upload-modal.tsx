import { ResponsiveDialog } from "@/components/responsive-dialog";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";

type Props = {
    videoId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const ThumbnailUploadModal = ({
    videoId,
    open,
    onOpenChange,
}: Props) => {
    const utils = trpc.useUtils();

    const onUploadComplete = () => {
        utils.studio.getMany.invalidate();
        utils.videos.getOne.invalidate({ id: videoId });
        onOpenChange(false);
    };

    return (
        <ResponsiveDialog
            title="Upload a thumbnail"
            open={open}
            onOpenChange={onOpenChange}
        >
            <UploadDropzone
                endpoint="thumbnailUploader"
                input={{ videoId }}
                onClientUploadComplete={onUploadComplete}
                config={{
                    mode: "auto",
                }}
            />
        </ResponsiveDialog>
    );
};

"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { StudioUploader } from "@/components/studio-uploader";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const StudioUploadModal = () => {
    const utils = trpc.useUtils();
    const create = trpc.videos.create.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate();
            // toast.success("Video created");
        },
        onError: (err) => {
            toast.error(err.message ?? "Failed to create video");
        },
    });

    const router = useRouter();

    const onSuccess = () => {
        if (!create.data?.video) return;

        create.reset();
        router.push(`/studio/videos/${create.data.video.id}`);
    };

    return (
        <>
            <ResponsiveDialog
                title="Upload a video"
                open={!!create.data?.url}
                onOpenChange={() => create.reset()}
            >
                {create.data?.url ? (
                    <StudioUploader
                        endpoint={create.data.url}
                        onSuccess={onSuccess}
                    />
                ) : (
                    <Loader className="animate-spin" />
                )}
            </ResponsiveDialog>
            <Button
                variant="secondary"
                onClick={() => create.mutate()}
                disabled={create.isPending}
            >
                {create.isPending ? (
                    <Loader className="animate-spin" />
                ) : (
                    <Plus />
                )}
                Create
            </Button>
        </>
    );
};

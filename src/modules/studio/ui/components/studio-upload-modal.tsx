"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader, Plus } from "lucide-react";
import { toast } from "sonner";

export const StudioUploadModal = () => {
    const utils = trpc.useUtils();
    const create = trpc.videos.create.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate();
            toast.success("Video created");
        },
        onError: (err) => {
            toast.error(err.message ?? "Failed to create video");
        },
    });

    return (
        <Button
            variant="secondary"
            onClick={() => create.mutate()}
            disabled={create.isPending}
        >
            {create.isPending ? <Loader className="animate-spin" /> : <Plus />}
            Create
        </Button>
    );
};

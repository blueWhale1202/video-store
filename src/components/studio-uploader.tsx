import MuxUploader, {
    MuxUploaderDrop,
    MuxUploaderFileSelect,
    MuxUploaderProgress,
    MuxUploaderStatus,
} from "@mux/mux-uploader-react";
import { UploadIcon } from "lucide-react";
import { useId } from "react";
import { Button } from "./ui/button";

type Props = {
    endpoint?: string | null;
    onSuccess?: () => void;
};

export const StudioUploader = ({ endpoint, onSuccess }: Props) => {
    const uploaderId = useId();

    return (
        <div>
            <MuxUploader
                id={uploaderId}
                className="group/uploader hidden"
                endpoint={endpoint}
                onSuccess={onSuccess}
            />
            <MuxUploaderDrop muxUploader={uploaderId} className="group/drop">
                <div
                    slot="heading"
                    className="flex flex-col items-center gap-6"
                >
                    <div className="flex size-32 items-center justify-center gap-2 rounded-full bg-muted">
                        <UploadIcon className="size-10 text-muted-foreground group-active/drop:animate-bounce" />
                    </div>
                    <div className="flex flex-col gap-2 text-center">
                        <p className="text-sm">
                            Drag and drop video files to upload
                        </p>
                        <p>
                            Your videos will be private until you publish them
                        </p>
                    </div>

                    <MuxUploaderFileSelect muxUploader={uploaderId}>
                        <Button type="button" className="rounded-full">
                            Select files
                        </Button>
                    </MuxUploaderFileSelect>
                </div>
                <span slot="separator" className="hidden" />
                <MuxUploaderStatus
                    muxUploader={uploaderId}
                    className="text-sm"
                />
                <MuxUploaderProgress
                    muxUploader={uploaderId}
                    type="percentage"
                />
                <MuxUploaderProgress muxUploader={uploaderId} type="bar" />
            </MuxUploaderDrop>
        </div>
    );
};

import { FormSection } from "../ui/sections/form-section";

type Props = {
    videoId: string;
};

export const VideoView = ({ videoId }: Props) => {
    return (
        <div className="max-w-screen-lg px-4 pt-2.5">
            <FormSection videoId={videoId} />
        </div>
    );
};

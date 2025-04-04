import { CommentsSection } from "../ui/sections/comments-section.tsx";
import { SuggestionsSection } from "../ui/sections/suggestions-section";
import { VideoSection } from "../ui/sections/video-section";

type Props = {
    id: string;
};

export const VideoView = ({ id }: Props) => {
    return (
        <div className="mx-auto mb-10 flex max-w-[1700px] flex-col px-4 pt-2.5">
            <div className="flex flex-col gap-6 xl:flex-row">
                <div className="min-w-0 flex-1">
                    <VideoSection id={id} />
                    <div className="mt-4 block xl:hidden">
                        <SuggestionsSection videoId={id} isManual />
                    </div>
                    <CommentsSection videoId={id} />
                </div>
                <div className="shrink-1 hidden w-full xl:block xl:w-[380px] 2xl:w-[460px]">
                    <SuggestionsSection videoId={id} />
                </div>
            </div>
        </div>
    );
};

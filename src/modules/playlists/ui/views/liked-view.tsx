import { LikedVideosSection } from "../sections/liked-videos-section";

export const LikedView = () => {
    return (
        <div className="mx-auto mb-10 flex max-w-screen-md flex-col gap-y-6 px-4 pt-2.5">
            <div>
                <h1 className="text-xl font-bold">Liked</h1>
                <p className="text-xs text-muted-foreground">Video you liked</p>
            </div>
            <LikedVideosSection />
        </div>
    );
};

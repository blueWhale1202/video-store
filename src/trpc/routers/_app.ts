import { categoriesRouter } from "@/modules/categories/server/procedures";
import { studioRouter } from "@/modules/studio/server/procedures";
import { videoRouter } from "@/modules/videos/server/procedures";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
    studio: studioRouter,
    videos: videoRouter,
    categories: categoriesRouter,
});

export type AppRouter = typeof appRouter;

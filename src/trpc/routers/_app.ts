import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const appRouter = createTRPCRouter({
    hello: protectedProcedure
        .input(
            z.object({
                text: z.string(),
            }),
        )
        .query((opts) => {
            console.log({ dbUser: opts.ctx.user });
            return {
                greeting: `hello ${opts.input.text}, name is ${opts.ctx.user.name}`,
            };
        }),
});

export type AppRouter = typeof appRouter;

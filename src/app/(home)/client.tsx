"use client";

import { trpc } from "@/trpc/client";

export const PageClient = () => {
    const [data] = trpc.hello.useSuspenseQuery({
        text: "world",
    });
    return <div>Page client says: {data.greeting}</div>;
};

import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { PageClient } from "./client";

export default async function AppPage() {
    void trpc.hello.prefetch({ text: "world" });

    return (
        <HydrateClient>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <Suspense fallback={<div>Loading...</div>}>
                    <PageClient />
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    );
}

"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { PlaylistCreateModal } from "../components/playlist-create-modal";
import { PlaylistsSection } from "../sections/playlists-section";

export const PlaylistsView = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="mx-auto mb-10 flex max-w-[2400px] flex-col gap-y-6 px-4 pt-2.5">
            <PlaylistCreateModal onOpenChange={setOpen} open={open} />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Playlists</h1>
                    <p className="text-xs text-muted-foreground">
                        Collections you have created
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setOpen(true)}
                >
                    <Plus />
                </Button>
            </div>
            <PlaylistsSection />
        </div>
    );
};

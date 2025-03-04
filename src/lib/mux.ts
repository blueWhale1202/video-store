import Mux from "@mux/mux-node";

export const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export function getMuxThumbnailUrl(playbackId: string) {
    return `https://image.mux.com/${playbackId}/thumbnail.png`;
}

export function getMuxPreviewUrl(playbackId: string) {
    return `https://image.mux.com/${playbackId}/animated.gif?width=640&fps=30`;
}

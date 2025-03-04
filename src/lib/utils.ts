import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNow } from "date-fns";
import { DateTime } from "luxon";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDuration(ms: number) {
    return DateTime.fromMillis(ms).toUTC().toFormat("HH:mm:ss");
}

export function snakeToTitle(snakeStr: string) {
    return snakeStr
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getVideoUrl(videoId: string) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/videos/${videoId}`;
}

export function formatNumber(views: number) {
    const compact = Intl.NumberFormat("en", {
        notation: "compact",
    }).format(views);

    const expanded = Intl.NumberFormat("en", {
        notation: "standard",
    }).format(views);

    return { compact, expanded };
}

export function formatDate(date: Date) {
    const compactDate = formatDistanceToNow(date, { addSuffix: true });
    const expandedDate = format(date, "d MMM yyyy");

    return { compactDate, expandedDate };
}

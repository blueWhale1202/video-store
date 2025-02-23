import { clsx, type ClassValue } from "clsx";
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

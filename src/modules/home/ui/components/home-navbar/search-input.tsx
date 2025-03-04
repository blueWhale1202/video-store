"use client";

import { Button } from "@/components/ui/button";
import { SearchIcon, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export const SearchInput = () => {
    const searchParams = useSearchParams();
    const [value, setValue] = useState(
        () => searchParams.get("query")?.toString() ?? "",
    );
    const router = useRouter();
    const pathname = usePathname();

    const onSearch = useDebouncedCallback((value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value.trim()) {
            params.set("query", value);
        } else {
            params.delete("query");
        }
        router.push(`${pathname}?${params.toString()}`);
    }, 300);

    const onChange = (value: string) => {
        setValue(value);
        onSearch(value);
    };

    const onClear = () => {
        setValue("");
        onSearch("");
    };

    return (
        <form className="flex w-full max-w-[600px]">
            <div className="relative w-full">
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full rounded-l-full border py-2 pl-4 pr-12 focus:border-blue-500 focus:outline-none"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />

                {value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                    >
                        <X className="text-gray-500" />
                    </Button>
                )}
            </div>
            <button
                disabled={!value.trim()}
                type="submit"
                className="rounded-r-full border border-l-0 bg-gray-100 px-5 py-2.5 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <SearchIcon className="size-5 text-muted-foreground" />
            </button>
        </form>
    );
};

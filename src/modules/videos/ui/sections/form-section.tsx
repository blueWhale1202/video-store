"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { videoUpdateSchema } from "@/db/schema";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { getVideoUrl, snakeToTitle } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Copy,
    CopyCheck,
    Globe2,
    ImagePlus,
    Loader,
    Lock,
    MoreHorizontal,
    RotateCcw,
    Sparkles,
    Trash,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { THUMBNAIL_FALLBACK } from "../../constants";
import { ThumbnailGenerateModal } from "../components/thumbnail-generate-modal";
import { ThumbnailUploadModal } from "../components/thumbnail-upload-modal";
import { VideoPlayer } from "../components/video-player";

type Props = {
    videoId: string;
};

export const FormSection = ({ videoId }: Props) => {
    return (
        <ErrorBoundary fallback={<div>Failed to load form section</div>}>
            <Suspense fallback={<FormSectionSkeleton />}>
                <FormSectionSuspense videoId={videoId} />
            </Suspense>
        </ErrorBoundary>
    );
};

export const FormSectionSkeleton = () => {
    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-7 w-20" />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="space-y-8 lg:col-span-3">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-[220px] w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-[84px] w-[152px]" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                <div className="flex flex-col gap-y-8 lg:col-span-2">
                    <div className="flex flex-col gap-4 overflow-hidden rounded-xl bg-[#f9f9f9]">
                        <Skeleton className="aspect-video" />
                        <div className="space-y-6 p-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-5 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                </div>
            </div>
        </div>
    );
};

type FormData = z.infer<typeof videoUpdateSchema>;

export const FormSectionSuspense = ({ videoId }: Props) => {
    const { isCopied, copyToClipboard } = useCopyToClipboard();
    const router = useRouter();
    const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);
    const [generateModalOpen, setGenerateModalOpen] = useState(false);

    const [video] = trpc.studio.getOne.useSuspenseQuery({
        id: videoId,
    });
    const [categories] = trpc.categories.getMany.useSuspenseQuery();

    const utils = trpc.useUtils();
    const update = trpc.videos.update.useMutation({
        onSuccess(data) {
            utils.studio.getMany.invalidate();
            utils.studio.getOne.invalidate({ id: data.id });
            toast.success("Video updated");
        },
        onError(err) {
            console.error(err);
            toast.error("Something went wrong");
        },
    });

    const remove = trpc.videos.remove.useMutation({
        onSuccess() {
            utils.studio.getMany.invalidate();
            toast.success("Video deleted");
            router.push("/studio");
        },
        onError(err) {
            console.error(err);
            toast.error("Something went wrong");
        },
    });

    const revalidate = trpc.videos.revalidate.useMutation({
        onSuccess() {
            utils.studio.getMany.invalidate();
            utils.studio.getOne.invalidate({ id: video.id });
            toast.success("Video revalidated");
        },
        onError(err) {
            console.error(err);
            toast.error("Something went wrong");
        },
    });

    const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
        onSuccess() {
            utils.studio.getMany.invalidate();
            utils.studio.getOne.invalidate({ id: video.id });
            toast.success("Thumbnail restored");
        },
        onError(err) {
            console.error(err);
            toast.error("Something went wrong");
        },
    });

    const generateTitle = trpc.videos.generateTitle.useMutation({
        onSuccess() {
            toast.success("Background job started", {
                description: "This may take some time",
            });
        },
        onError(err) {
            console.error(err);
            toast.error("Something went wrong");
        },
    });

    const generateDescription = trpc.videos.generateDescription.useMutation({
        onSuccess() {
            toast.success("Background job started", {
                description: "This may take some time",
            });
        },
        onError(err) {
            console.error(err);
            toast.error("Something went wrong");
        },
    });

    const form = useForm<FormData>({
        resolver: zodResolver(videoUpdateSchema),
        defaultValues: video,
    });

    const onSubmit = (data: FormData) => {
        update.mutate(data);
    };

    const onRemove = () => {
        remove.mutate({ id: video.id });
    };

    const fullUrl = getVideoUrl(video.id);

    return (
        <>
            <ThumbnailUploadModal
                videoId={video.id}
                open={thumbnailModalOpen}
                onOpenChange={setThumbnailModalOpen}
            />
            <ThumbnailGenerateModal
                videoId={video.id}
                open={generateModalOpen}
                onOpenChange={setGenerateModalOpen}
            />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Video details
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Manage your video details
                            </p>
                        </div>
                        <div className="flex items-center gap-x-2">
                            <Button
                                type="submit"
                                disabled={
                                    update.isPending || !form.formState.isDirty
                                }
                            >
                                Save
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        {remove.isPending ? (
                                            <Loader className="animate-spin text-muted-foreground" />
                                        ) : (
                                            <MoreHorizontal />
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() =>
                                            revalidate.mutate({ id: videoId })
                                        }
                                    >
                                        <RotateCcw /> Revalidate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onRemove}>
                                        <Trash /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                        <div className="space-y-8 lg:col-span-3">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            <div className="flex items-center gap-x-2">
                                                Title
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-6 rounded-full [&_svg]:size-3"
                                                    disabled={
                                                        generateTitle.isPending ||
                                                        !video.muxTrackId
                                                    }
                                                    onClick={() =>
                                                        generateTitle.mutate({
                                                            id: videoId,
                                                        })
                                                    }
                                                >
                                                    {generateTitle.isPending ? (
                                                        <Loader className="animate-spin text-muted-foreground" />
                                                    ) : (
                                                        <Sparkles />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Add a title to your video"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            <div className="flex items-center gap-x-2">
                                                Description
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="size-6 rounded-full [&_svg]:size-3"
                                                    disabled={
                                                        generateDescription.isPending ||
                                                        !video.muxTrackId
                                                    }
                                                    onClick={() =>
                                                        generateDescription.mutate(
                                                            {
                                                                id: videoId,
                                                            },
                                                        )
                                                    }
                                                >
                                                    {generateDescription.isPending ? (
                                                        <Loader className="animate-spin text-muted-foreground" />
                                                    ) : (
                                                        <Sparkles />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                value={field.value ?? ""}
                                                rows={10}
                                                className="resize-none pr-10"
                                                placeholder="Add a description to your video"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="thumbnailUrl"
                                render={({}) => (
                                    <FormItem>
                                        <FormLabel>Thumbnail</FormLabel>
                                        <FormControl>
                                            <div className="group relative h-[84px] w-[153px] p-0.5">
                                                <Image
                                                    src={
                                                        video.thumbnailUrl ??
                                                        THUMBNAIL_FALLBACK
                                                    }
                                                    alt="Thumbnail"
                                                    className="object-cover"
                                                    fill
                                                />
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            className="absolute right-1 top-1 size-7 rounded-full bg-black/50 opacity-100 duration-300 hover:bg-black/50 group-hover:opacity-100 md:opacity-0"
                                                        >
                                                            <MoreHorizontal className="text-white" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="start"
                                                        side="right"
                                                    >
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setThumbnailModalOpen(
                                                                    true,
                                                                )
                                                            }
                                                        >
                                                            <ImagePlus />
                                                            Change
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setGenerateModalOpen(
                                                                    true,
                                                                )
                                                            }
                                                        >
                                                            <Sparkles />
                                                            AI-generate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                restoreThumbnail.mutate(
                                                                    {
                                                                        id: videoId,
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            <RotateCcw />
                                                            Restore
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={
                                                    field.value ?? undefined
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map(
                                                        (category) => (
                                                            <SelectItem
                                                                key={
                                                                    category.id
                                                                }
                                                                value={
                                                                    category.id
                                                                }
                                                            >
                                                                {category.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex flex-col gap-y-8 lg:col-span-2">
                            <div className="flex h-fit flex-col gap-4 overflow-hidden rounded-xl bg-[#f9f9f9]">
                                <div className="relative aspect-video overflow-hidden">
                                    <VideoPlayer
                                        playbackId={video.muxPlaybackId}
                                        thumbnailUrl={video.thumbnailUrl}
                                        autoPlay={false}
                                        onPlay={() => {}}
                                    />
                                </div>
                                <div className="flex flex-col gap-y-6 p-4">
                                    <div className="flex items-center justify-between gap-x-2">
                                        <div className="flex flex-col gap-y-1">
                                            <p className="text-xs text-muted-foreground">
                                                Video link
                                            </p>
                                            <div className="flex items-center gap-x-2">
                                                <Link
                                                    prefetch
                                                    href={`/videos/${video.id}`}
                                                    className="line-clamp-1 text-sm text-blue-500"
                                                >
                                                    {fullUrl}
                                                </Link>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="shrink-0"
                                                    disabled={isCopied}
                                                    onClick={() =>
                                                        copyToClipboard(fullUrl)
                                                    }
                                                >
                                                    {isCopied ? (
                                                        <CopyCheck />
                                                    ) : (
                                                        <Copy />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-y-1">
                                            <p className="text-xs text-muted-foreground">
                                                Video status
                                            </p>
                                            <p className="text-sm">
                                                {snakeToTitle(
                                                    video.muxStatus ||
                                                        "preparing",
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-y-1">
                                            <p className="text-xs text-muted-foreground">
                                                Subtitles status
                                            </p>
                                            <p className="text-sm">
                                                {snakeToTitle(
                                                    video.muxTrackStatus ||
                                                        "no_subtitles",
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="visibility"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Visibility</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={
                                                    field.value ?? undefined
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="public">
                                                        <div className="flex items-center">
                                                            <Globe2 className="mr-2 size-4" />
                                                            Public
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="private">
                                                        <div className="flex items-center">
                                                            <Lock className="mr-2 size-4" />
                                                            Private
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </form>
            </Form>
        </>
    );
};

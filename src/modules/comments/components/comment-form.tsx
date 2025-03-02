import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { commentInsertSchema } from "@/db/schema";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useClerk, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Props = {
    videoId: string;
    parentId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    variant?: "comment" | "reply";
};

const formSchema = commentInsertSchema.omit({ userId: true });
type FormValues = z.infer<typeof formSchema>;

export const CommentForm = ({
    videoId,
    parentId,
    onSuccess,
    onCancel,
    variant = "comment",
}: Props) => {
    const { user } = useUser();
    const clerk = useClerk();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: "",
            videoId,
            parentId,
        },
    });

    const utils = trpc.useUtils();
    const create = trpc.comments.create.useMutation({
        onSuccess() {
            form.reset();
            toast.success("Comment added");
            onSuccess?.();
            utils.comments.getMany.invalidate({ videoId });
            utils.comments.getMany.invalidate({ videoId, parentId });
        },
        onError(err) {
            toast.error("Something went wrong");
            if (err.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        },
    });

    const onSubmit = (values: FormValues) => {
        create.mutate({
            ...values,
            videoId,
            parentId,
        });
    };

    return (
        <Form {...form}>
            <form
                className="group flex gap-4"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <UserAvatar
                    size="lg"
                    imageUrl={user?.imageUrl || "/user-placeholder.svg"}
                    name={user?.username || "Anonymous"}
                    className={cn(
                        !user?.imageUrl &&
                            "items-end justify-center bg-accent [&_img]:size-3/4",
                    )}
                />

                <div className="flex-1">
                    <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        className="min-h-0 resize-none overflow-hidden bg-transparent"
                                        placeholder={
                                            variant === "reply"
                                                ? "Replay this comment..."
                                                : "Add a comment"
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="mt-2 flex justify-end gap-2">
                        {onCancel && (
                            <Button
                                variant="ghost"
                                type="button"
                                onClick={() => {
                                    form.reset();
                                    onCancel();
                                }}
                            >
                                Cancel
                            </Button>
                        )}

                        <Button
                            type="submit"
                            size="sm"
                            disabled={create.isPending}
                        >
                            {variant === "reply" ? "Reply" : "Comment"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
};

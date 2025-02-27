import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Props = {
    videoId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const formSchema = z.object({
    prompt: z.string().min(10).max(200),
});

type FormValues = z.infer<typeof formSchema>;

export const ThumbnailGenerateModal = ({
    videoId,
    open,
    onOpenChange,
}: Props) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: "",
        },
    });

    const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
        onSuccess() {
            toast.success("Background job started", {
                description: "This may take some time",
            });
            onOpenChange(false);
        },
        onError(err) {
            console.error(err);
            toast.error("Something went wrong");
        },
    });

    const onSubmit = (values: FormValues) => {
        generateThumbnail.mutate({
            id: videoId,
            prompt: values.prompt,
        });
    };

    return (
        <ResponsiveDialog
            title="Upload a thumbnail"
            open={open}
            onOpenChange={onOpenChange}
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-4"
                >
                    <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prompt</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        className="resize-none"
                                        cols={30}
                                        rows={5}
                                        placeholder="A description of wanted thumbnail"
                                    />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={generateThumbnail.isPending}
                        >
                            Generate
                        </Button>
                    </div>
                </form>
            </Form>
        </ResponsiveDialog>
    );
};

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
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const formSchema = z.object({
    name: z.string().min(1).max(255),
});

type FormValues = z.infer<typeof formSchema>;

export const PlaylistCreateModal = ({ open, onOpenChange }: Props) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    const utils = trpc.useUtils();
    const create = trpc.playlists.create.useMutation({
        onSuccess() {
            form.reset();
            toast.success("Playlist created");
            utils.playlists.getMany.invalidate();
            onOpenChange(false);
        },
        onError(err) {
            console.error(err);
            toast.error("Something went wrong");
        },
    });

    const onSubmit = (values: FormValues) => {
        create.mutate(values);
    };

    return (
        <ResponsiveDialog
            title="Create Playlist"
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
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="My favorite video"
                                    />
                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={create.isPending}>
                            Create
                        </Button>
                    </div>
                </form>
            </Form>
        </ResponsiveDialog>
    );
};

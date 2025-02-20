import { StudioLayout } from "@/modules/studio/ui/layouts/studio-layout";

type Props = {
    children: React.ReactNode;
};

export default async function Layout({ children }: Props) {
    return <StudioLayout>{children}</StudioLayout>;
}

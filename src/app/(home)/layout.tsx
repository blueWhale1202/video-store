import { HomeLayout } from "@/modules/home/ui/layouts/home-layout";

type Props = {
    children: React.ReactNode;
};

export default async function Layout({ children }: Props) {
    return <HomeLayout>{children}</HomeLayout>;
}

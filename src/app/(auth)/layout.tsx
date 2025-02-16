type Props = {
    children: React.ReactNode;
};

export default async function AuthLayout({ children }: Props) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            {children}
        </div>
    );
}

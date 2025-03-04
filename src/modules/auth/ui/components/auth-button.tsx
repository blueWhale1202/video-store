"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Clapperboard, UserCircle, UserIcon } from "lucide-react";

export const AuthButton = () => {
    return (
        <>
            <SignedIn>
                <UserButton>
                    <UserButton.MenuItems>
                        <UserButton.Link
                            label="My profile"
                            href="/users/current"
                            labelIcon={<UserIcon className="size-4" />}
                        />
                        <UserButton.Link
                            label="Studio"
                            href="/studio"
                            labelIcon={<Clapperboard className="size-4" />}
                        />
                        <UserButton.Action label="manageAccount" />
                    </UserButton.MenuItems>
                </UserButton>
            </SignedIn>
            <SignedOut>
                <SignInButton mode="modal">
                    <Button
                        variant="outline"
                        className="rounded-full border-blue-500/20 px-4 py-2 text-sm font-medium text-blue-600 shadow-none hover:text-blue-500 [&_svg]:size-5"
                    >
                        <UserCircle />
                        Sign In
                    </Button>
                </SignInButton>
            </SignedOut>
        </>
    );
};

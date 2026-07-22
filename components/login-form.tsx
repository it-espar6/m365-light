"use client"

import { signIn } from "next-auth/react"
import { Button } from "./ui/button"

export default function LoginForm({

}: {

    }) {


    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
            <div className="flex flex-col items-center gap-2">
                <h1 className="text-2xl font-medium">m365-light</h1>
                <p className="text-muted-foreground text-sm text-balance text-center max-w-xs">
                    Sign in with your Microsoft 365 account to access the admin panel.
                </p>
            </div>

            <Button
                onClick={() => signIn("azure-ad", { callbackUrl: "/dashboard" })}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px"
            >
                Sign in with Microsoft 365
            </Button>
        </div>
    )
}
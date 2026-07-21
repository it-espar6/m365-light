import { AzureADLoginButton } from "./azure-ad-login-button"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-medium">m365-light</h1>
        <p className="text-muted-foreground text-sm text-balance text-center max-w-xs">
          Sign in with your Microsoft 365 account to access the admin panel.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error === "AccessDenied"
            ? "Access denied. You do not belong to the authorized group."
            : "An error occurred during sign in."}
        </div>
      )}

      <AzureADLoginButton />
    </div>
  )
}

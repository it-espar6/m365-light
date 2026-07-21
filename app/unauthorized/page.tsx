import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-3xl font-medium">Access denied</h1>
      <p className="text-muted-foreground text-sm">
        You do not belong to the authorized group.
      </p>
      <Link
        href="/"
        className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
      >
        Back to home
      </Link>
    </div>
  )
}

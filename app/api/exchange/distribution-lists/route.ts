import { withAuth, notAvailable } from "@/lib/api-utils"

export const GET = withAuth(async () => notAvailable())
export const POST = withAuth(async () => notAvailable())
export const DELETE = withAuth(async () => notAvailable())

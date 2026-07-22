import { withAuth, success, error } from "@/lib/api-utils"
import { createUser, getUsers } from "@/lib/graph/users"
import { audit } from "@/lib/audit"

export const GET = withAuth(async (_session, req) => {
  const { searchParams } = new URL(req.url)
  const country = searchParams.get("country")
  const search = searchParams.get("search")
  const includeLicenses = searchParams.get("licenses") === "true"

  try {
    const filter = country ? `country eq '${country}'` : undefined
    const users = await getUsers(filter, search ?? undefined, includeLicenses)
    return success(users)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to fetch users")
  }
})

export const POST = withAuth(async (session, req) => {
  const body = await req.json()

  try {
    const result = await createUser(body)
    audit("user.create", session.user?.email ?? "unknown", `Created user "${body.displayName}"`, result.user.id)
    return success(result, 201)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to create user")
  }
})

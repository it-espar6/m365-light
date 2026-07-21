import { withAuth, success, error } from "@/lib/api-utils"
import { createUser, getUsers } from "@/lib/graph/users"

export const GET = withAuth(async (_session, req) => {
  const { searchParams } = new URL(req.url)
  const country = searchParams.get("country")
  const search = searchParams.get("search")

  try {
    const filter = country ? `country eq '${country}'` : undefined
    const users = await getUsers(filter, search ?? undefined)
    return success(users)
  } catch {
    return error("Unable to fetch users")
  }
})

export const POST = withAuth(async (_session, req) => {
  const body = await req.json()

  try {
    const result = await createUser(body)
    return success(result, 201)
  } catch {
    return error("Unable to create user")
  }
})

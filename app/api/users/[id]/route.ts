import { withAuth, success, error } from "@/lib/api-utils"
import { getUserById, updateUser, deleteUser } from "@/lib/graph/users"

export const GET = withAuth(async (_session, _req, params) => {
  try {
    const user = await getUserById(params.id)
    return success(user)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "User not found")
  }
})

export const PUT = withAuth(async (_session, req, params) => {
  const body = await req.json()

  try {
    const updated = await updateUser(params.id, body)
    return success(updated)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to update user")
  }
})

export const DELETE = withAuth(async (_session, _req, params) => {
  try {
    const result = await deleteUser(params.id)
    return success(result)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to delete user")
  }
})

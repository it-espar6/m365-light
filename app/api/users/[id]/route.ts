import { withAuth, success, error } from "@/lib/api-utils"
import { getUserById, updateUser, deleteUser } from "@/lib/graph/users"
import { audit } from "@/lib/audit"

export const GET = withAuth(async (_session, _req, params) => {
  try {
    const user = await getUserById(params.id)
    return success(user)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "User not found")
  }
})

export const PUT = withAuth(async (session, req, params) => {
  const body = await req.json()

  try {
    const updated = await updateUser(params.id, body)
    audit("user.update", session.user?.email ?? "unknown", `Updated user "${updated.displayName}"`, params.id)
    return success(updated)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to update user")
  }
})

export const DELETE = withAuth(async (session, _req, params) => {
  try {
    const result = await deleteUser(params.id)
    audit("user.delete", session.user?.email ?? "unknown", `Deleted user ${params.id}`, params.id)
    return success(result)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to delete user")
  }
})

import { withAuth, success, error } from "@/lib/api-utils"
import { getUserById, updateUser, deleteUser } from "@/lib/graph/users"

export const GET = withAuth(async (_session, _req, params) => {
  try {
    const user = await getUserById(params.id)
    return success(user)
  } catch {
    return error("User not found")
  }
})

export const PUT = withAuth(async (_session, req, params) => {
  const body = await req.json()

  try {
    const updated = await updateUser(params.id, body)
    return success(updated)
  } catch {
    return error("Unable to update user")
  }
})

export const DELETE = withAuth(async (_session, _req, params) => {
  try {
    const result = await deleteUser(params.id)
    return success(result)
  } catch {
    return error("Unable to delete user")
  }
})

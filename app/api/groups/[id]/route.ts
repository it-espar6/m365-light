import { withAuth, success, error } from "@/lib/api-utils"
import { deleteGroup, updateGroup } from "@/lib/graph/groups"
import { audit } from "@/lib/audit"

export const PATCH = withAuth(async (session, req, params) => {
  const body = await req.json()

  try {
    const group = await updateGroup(params.id, body)
    audit("group.update", session.user?.email ?? "unknown", `Updated group "${body.displayName ?? group.displayName}"`, params.id)
    return success(group)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to update group")
  }
})

export const DELETE = withAuth(async (session, _req, params) => {
  try {
    await deleteGroup(params.id)
    audit("group.delete", session.user?.email ?? "unknown", `Deleted group ${params.id}`, params.id)
    return success({ success: true })
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to delete group")
  }
})

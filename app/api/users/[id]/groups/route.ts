import { withAuth, success, error } from "@/lib/api-utils"
import { getUserGroups, addMemberToGroup, removeMemberFromGroup } from "@/lib/graph/groups"

export const GET = withAuth(async (_session, _req, params) => {
  try {
    const groups = await getUserGroups(params.id)
    return success(groups)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to fetch user groups")
  }
})

export const POST = withAuth(async (_session, req, params) => {
  const { groupId } = await req.json()

  if (!groupId) {
    return error("groupId is required")
  }

  try {
    const result = await addMemberToGroup(groupId, params.id)
    return success(result, 201)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to assign group")
  }
})

export const DELETE = withAuth(async (_session, req, params) => {
  const { searchParams } = new URL(req.url)
  const groupId = searchParams.get("groupId")

  if (!groupId) {
    return error("groupId is required")
  }

  try {
    const result = await removeMemberFromGroup(groupId, params.id)
    return success(result)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to unassign group")
  }
})

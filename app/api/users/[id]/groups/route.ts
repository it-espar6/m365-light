import { withAuth, success, error } from "@/lib/api-utils"
import { getGroupById, getUserGroups, addMemberToGroup, removeMemberFromGroup } from "@/lib/graph/groups"
import { audit } from "@/lib/audit"

export const GET = withAuth(async (_session, _req, params) => {
  try {
    const groups = await getUserGroups(params.id)
    return success(groups)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to fetch user groups")
  }
})

export const POST = withAuth(async (session, req, params) => {
  const { groupId } = await req.json()

  if (!groupId) {
    return error("groupId is required")
  }

  try {
    const group = await getGroupById(groupId)
    const result = await addMemberToGroup(groupId, params.id)
    audit("group.member.add", session.user?.email ?? "unknown", `Added user ${params.id} to group "${group.displayName}"`, groupId)
    return success(result, 201)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to assign group")
  }
})

export const DELETE = withAuth(async (session, req, params) => {
  const { searchParams } = new URL(req.url)
  const groupId = searchParams.get("groupId")

  if (!groupId) {
    return error("groupId is required")
  }

  try {
    const group = await getGroupById(groupId)
    const result = await removeMemberFromGroup(groupId, params.id)
    audit("group.member.remove", session.user?.email ?? "unknown", `Removed user ${params.id} from group "${group.displayName}"`, groupId)
    return success(result)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to unassign group")
  }
})

import { withAuth, success, error } from "@/lib/api-utils"
import { getGroupById, getGroupMembers, addMemberToGroup, removeMemberFromGroup } from "@/lib/graph/groups"
import { audit } from "@/lib/audit"

export const GET = withAuth(async (_session, _req, params) => {
  try {
    const members = await getGroupMembers(params.id)
    return success(members)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to fetch group members")
  }
})

export const POST = withAuth(async (session, req, params) => {
  const body = await req.json()

  try {
    const result = await addMemberToGroup(params.id, body.userId)
    const group = await getGroupById(params.id)
    audit("group.member.add", session.user?.email ?? "unknown", `Added user ${body.userId} to group "${group.displayName}"`, params.id)
    return success(result, 201)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to add member to the group")
  }
})

export const DELETE = withAuth(async (session, req, params) => {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return error("userId is required")
  }

  try {
    const result = await removeMemberFromGroup(params.id, userId)
    const group = await getGroupById(params.id)
    audit("group.member.remove", session.user?.email ?? "unknown", `Removed user ${userId} from group "${group.displayName}"`, params.id)
    return success(result)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to remove member from the group")
  }
})

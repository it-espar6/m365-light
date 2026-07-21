import { withAuth, success, error } from "@/lib/api-utils"
import { getGroupMembers, addMemberToGroup, removeMemberFromGroup } from "@/lib/graph/groups"

export const GET = withAuth(async (_session, _req, params) => {
  try {
    const members = await getGroupMembers(params.id)
    return success(members)
  } catch {
    return error("Unable to fetch group members")
  }
})

export const POST = withAuth(async (_session, req, params) => {
  const body = await req.json()

  try {
    const result = await addMemberToGroup(params.id, body.userId)
    return success(result, 201)
  } catch {
    return error("Unable to add member to the group")
  }
})

export const DELETE = withAuth(async (_session, req, params) => {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return error("userId is required")
  }

  try {
    const result = await removeMemberFromGroup(params.id, userId)
    return success(result)
  } catch {
    return error("Unable to remove member from the group")
  }
})

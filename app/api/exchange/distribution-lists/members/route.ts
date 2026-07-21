import { withAuth, success, error } from "@/lib/api-utils"
import { getDistributionListMembers, addDistributionListMember, removeDistributionListMember } from "@/lib/graph/exchange"

export const GET = withAuth(async (_session, req) => {
  const { searchParams } = new URL(req.url)
  const groupId = searchParams.get("groupId")

  if (!groupId) {
    return error("groupId is required")
  }

  try {
    const members = await getDistributionListMembers(groupId)
    return success(members)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to fetch distribution list members")
  }
})

export const POST = withAuth(async (_session, req) => {
  const body = await req.json()

  if (!body.groupId || !body.userId) {
    return error("groupId and userId are required")
  }

  try {
    const result = await addDistributionListMember(body.groupId, body.userId)
    return success(result, 201)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to add member to the distribution list")
  }
})

export const DELETE = withAuth(async (_session, req) => {
  const { searchParams } = new URL(req.url)
  const groupId = searchParams.get("groupId")
  const userId = searchParams.get("userId")

  if (!groupId || !userId) {
    return error("groupId and userId are required")
  }

  try {
    const result = await removeDistributionListMember(groupId, userId)
    return success(result)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to remove member from the distribution list")
  }
})

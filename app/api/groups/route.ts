import { withAuth, success, error } from "@/lib/api-utils"
import { getGroups, getGroupById, createGroup } from "@/lib/graph/groups"
import { audit } from "@/lib/audit"

export const GET = withAuth(async (_session, req) => {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search")
  const id = searchParams.get("id")

  try {
    if (id) {
      const group = await getGroupById(id)
      return success(group)
    }
    const groups = await getGroups(search ?? undefined)
    return success(groups)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to fetch groups")
  }
})

export const POST = withAuth(async (session, req) => {
  const { displayName, description } = await req.json()

  if (!displayName) {
    return error("displayName is required")
  }

  try {
    const group = await createGroup(displayName, description)
    audit("group.create", session.user?.email ?? "unknown", `Created group "${displayName}"`, group.id)
    return success(group, 201)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to create group")
  }
})

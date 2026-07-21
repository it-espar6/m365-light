import { withAuth, success, error } from "@/lib/api-utils"
import { getGroups } from "@/lib/graph/groups"

export const GET = withAuth(async (_session, req) => {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search")

  try {
    const groups = await getGroups(search ?? undefined)
    return success(groups)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to fetch groups")
  }
})

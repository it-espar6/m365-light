import { withAuth, success, error } from "@/lib/api-utils"
import { getDistributionLists, createDistributionList, deleteDistributionList } from "@/lib/graph/exchange"

export const GET = withAuth(async (_session, _req) => {
  try {
    const lists = await getDistributionLists()
    return success(lists)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to fetch distribution lists")
  }
})

export const POST = withAuth(async (_session, req) => {
  const body = await req.json()

  try {
    const list = await createDistributionList(body)
    return success(list, 201)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to create distribution list")
  }
})

export const DELETE = withAuth(async (_session, req) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return error("id is required")
  }

  try {
    const result = await deleteDistributionList(id)
    return success(result)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to delete distribution list")
  }
})

import { withAuth, success, error } from "@/lib/api-utils"
import { getUserLicenses, getSubscribedSkus, assignUserLicenses } from "@/lib/graph/licenses"

export const GET = withAuth(async (_session, _req, params) => {
  try {
    const [userLicenses, availableSkus] = await Promise.all([
      getUserLicenses(params.id),
      getSubscribedSkus(),
    ])
    return success({ userLicenses, availableSkus })
  } catch {
    return error("Unable to fetch license information")
  }
})

export const POST = withAuth(async (_session, req, params) => {
  const body = await req.json()
  const addLicenses: { skuId: string; disabledPlans: string[] }[] = body.addLicenses ?? []
  const removeLicenses: string[] = body.removeLicenses ?? []

  try {
    const result = await assignUserLicenses(params.id, addLicenses, removeLicenses)
    return success(result)
  } catch {
    return error("Unable to update licenses")
  }
})

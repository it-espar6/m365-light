import { withAuth, success, error } from "@/lib/api-utils"
import { getUserLicenses, getSubscribedSkus, assignUserLicenses } from "@/lib/graph/licenses"
import { audit } from "@/lib/audit"

export const GET = withAuth(async (_session, _req, params) => {
  try {
    const [userLicenses, availableSkus] = await Promise.all([
      getUserLicenses(params.id),
      getSubscribedSkus(),
    ])
    return success({ userLicenses, availableSkus })
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to fetch license information")
  }
})

export const POST = withAuth(async (session, req, params) => {
  const body = await req.json()
  const addLicenses: { skuId: string; disabledPlans: string[] }[] = body.addLicenses ?? []
  const removeLicenses: string[] = body.removeLicenses ?? []

  try {
    const result = await assignUserLicenses(params.id, addLicenses, removeLicenses)
    for (const lic of addLicenses) {
      audit("license.assign", session.user?.email ?? "unknown", `Assigned license ${lic.skuId} to user ${params.id}`, params.id)
    }
    for (const skuId of removeLicenses) {
      audit("license.remove", session.user?.email ?? "unknown", `Removed license ${skuId} from user ${params.id}`, params.id)
    }
    return success(result)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to update licenses")
  }
})

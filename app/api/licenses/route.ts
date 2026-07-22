import { withAuth, success, error } from "@/lib/api-utils"
import { getSubscribedSkus } from "@/lib/graph/licenses"

export const GET = withAuth(async () => {
  try {
    const skus = await getSubscribedSkus()

    const targetSkus = ["O365_BUSINESS_PREMIUM", "O365_BUSINESS_ESSENTIALS"]
    const data = skus
      .filter((s) => targetSkus.includes(s.skuPartNumber))
      .map((s) => ({
        skuPartNumber: s.skuPartNumber,
        consumed: s.consumedUnits,
        total: s.prepaidUnits.enabled,
        available: s.prepaidUnits.enabled - s.consumedUnits,
      }))

    return success(data)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to fetch license information")
  }
})

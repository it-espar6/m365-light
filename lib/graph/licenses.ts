import { getGraphClient } from "./client"

export interface LicenseDetail {
  id: string
  skuId: string
  skuPartNumber: string
  servicePlans: { servicePlanId: string; servicePlanName: string; provisioningStatus: string }[]
}

export interface SubscribedSku {
  id: string
  skuId: string
  skuPartNumber: string
  capbilityStatus: string
  consumedUnits: number
  prepaidUnits: { enabled: number; suspended: number; warning: number }
  servicePlans: { servicePlanId: string; servicePlanName: string }[]
}

export async function getUserLicenses(userId: string) {
  const client = await getGraphClient()
  const res = await client.api(`/users/${userId}/licenseDetails`).get()
  return res.value as LicenseDetail[]
}

export async function getSubscribedSkus() {
  const client = await getGraphClient()
  const res = await client.api("/subscribedSkus").get()
  return res.value as SubscribedSku[]
}

export async function assignUserLicenses(
  userId: string,
  addLicenses: { skuId: string; disabledPlans: string[] }[],
  removeLicenses: string[]
) {
  const client = await getGraphClient()
  const res = await client.api(`/users/${userId}/assignLicense`).post({
    addLicenses,
    removeLicenses,
  })
  return res
}

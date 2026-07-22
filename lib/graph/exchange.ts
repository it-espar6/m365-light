import { getGraphClient } from "./client"

export interface SharedMailbox {
  id: string
  displayName: string
  mail: string
  mailNickname: string
  description?: string
  createdDateTime?: string
  proxyAddresses?: string[]
  resourceProvisioningOptions?: string[]
  groupTypes?: string[]
  memberCount?: number
}

export interface DistributionList {
  id: string
  displayName: string
  mail: string
  mailNickname: string
  description?: string
  createdDateTime?: string
  proxyAddresses?: string[]
  resourceProvisioningOptions?: string[]
  groupTypes?: string[]
  memberCount?: number
}

export async function getSharedMailboxes() {
  return getMailEnabledGroups()
}

export async function getDistributionLists() {
  return getMailEnabledGroups()
}

async function getMailEnabledGroups() {
  const client = await getGraphClient()

  const response = await client
    .api("/groups")
    .select("id,displayName,mail,mailNickname,description,createdDateTime,proxyAddresses,resourceProvisioningOptions,groupTypes")
    .filter("mailEnabled eq true and securityEnabled eq false")
    //.top(100)
    .get()

  /*const allGroups = (response.value as SharedMailbox[]).filter(
  (g) => !g.groupTypes || g.groupTypes.length === 0
)*/

  const allGroups = (response.value as SharedMailbox[])

  const withCounts = await Promise.all(
    allGroups.map(async (item) => {
      try {
        const members = await client
          .api(`/groups/${item.id}/members`)
          .select("id")
          .get()
        return { ...item, memberCount: members.value?.length ?? 0 }
      } catch {
        return { ...item, memberCount: 0 }
      }
    })
  )

  return withCounts
}

export async function createSharedMailbox(data: {
  displayName: string
  mailNickname: string
}) {
  const client = await getGraphClient()

  const newMailbox = await client.api("/groups").post({
    displayName: data.displayName,
    mailNickname: data.mailNickname,
    mailEnabled: true,
    securityEnabled: false,
    groupTypes: [],
  })

  return newMailbox as SharedMailbox
}

export async function deleteSharedMailbox(groupId: string) {
  const client = await getGraphClient()
  await client.api(`/groups/${groupId}`).delete()
  return { success: true }
}

export async function createDistributionList(data: {
  displayName: string
  mailNickname: string
  description?: string
}) {
  const client = await getGraphClient()

  const newList = await client.api("/groups").post({
    displayName: data.displayName,
    mailNickname: data.mailNickname,
    description: data.description || "",
    mailEnabled: true,
    securityEnabled: false,
    groupTypes: [],
  })

  return newList as DistributionList
}

export async function deleteDistributionList(groupId: string) {
  const client = await getGraphClient()
  await client.api(`/groups/${groupId}`).delete()
  return { success: true }
}

export async function getDistributionListMembers(groupId: string) {
  const client = await getGraphClient()

  const response = await client
    .api(`/groups/${groupId}/members`)
    .select("id,displayName,mail,userPrincipalName")
    .top(50)
    .get()

  const members = response.value as {
    id: string
    displayName: string
    mail?: string
    userPrincipalName: string
  }[]

  const nextLink = response["@odata.nextLink"]

  return { members, hasMore: !!nextLink }
}

export async function addDistributionListMember(groupId: string, userId: string) {
  const client = await getGraphClient()

  await client.api(`/groups/${groupId}/members/$ref`).post({
    "@odata.id": `https://graph.microsoft.com/v1.0/users/${userId}`,
  })

  return { success: true }
}

export async function removeDistributionListMember(
  groupId: string,
  userId: string
) {
  const client = await getGraphClient()

  await client.api(`/groups/${groupId}/members/${userId}/$ref`).delete()

  return { success: true }
}

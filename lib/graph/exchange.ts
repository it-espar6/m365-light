import { getGraphClient } from "./client"

export interface SharedMailbox {
  id: string
  displayName: string
  mail: string
  mailNickname: string
}

export interface DistributionList {
  id: string
  displayName: string
  mail: string
  mailNickname: string
  memberCount?: number
}

export async function getSharedMailboxes() {
  const client = await getGraphClient()

  const response = await client
    .api("/groups")
    .select("id,displayName,mail,mailNickname")
    .filter(
      "mailEnabled eq true and securityEnabled eq false and groupTypes/any(c:c eq '')"
    )
    .top(100)
    .get()

  return response.value as SharedMailbox[]
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

export async function getDistributionLists() {
  const client = await getGraphClient()

  const response = await client
    .api("/groups")
    .select("id,displayName,mail,mailNickname")
    .filter(
      "mailEnabled eq true and securityEnabled eq false and groupTypes/any(c:c eq '')"
    )
    .top(100)
    .get()

  const lists = response.value as DistributionList[]

  const listsWithCount = await Promise.all(
    lists.map(async (list) => {
      try {
        const members = await client
          .api(`/groups/${list.id}/members`)
          .select("id")
          .get()
        return { ...list, memberCount: members.value?.length ?? 0 }
      } catch {
        return { ...list, memberCount: 0 }
      }
    })
  )

  return listsWithCount
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
    .get()

  return response.value as {
    id: string
    displayName: string
    mail?: string
    userPrincipalName: string
  }[]
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

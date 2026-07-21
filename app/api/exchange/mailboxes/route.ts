import { withAuth, success, error } from "@/lib/api-utils"
import { getSharedMailboxes, createSharedMailbox, deleteSharedMailbox } from "@/lib/graph/exchange"

export const GET = withAuth(async (_session, _req) => {
  try {
    const mailboxes = await getSharedMailboxes()
    return success(mailboxes)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to fetch shared mailboxes")
  }
})

export const POST = withAuth(async (_session, req) => {
  const body = await req.json()

  try {
    const mailbox = await createSharedMailbox(body)
    return success(mailbox, 201)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to create shared mailbox")
  }
})

export const DELETE = withAuth(async (_session, req) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return error("id is required")
  }

  try {
    const result = await deleteSharedMailbox(id)
    return success(result)
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to delete shared mailbox")
  }
})

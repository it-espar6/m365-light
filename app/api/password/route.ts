import { withAuth, success, error } from "@/lib/api-utils"
import { resetPassword, revokeMfaSessions } from "@/lib/graph/password"

export const POST = withAuth(async (_session, req) => {
  const body = await req.json()

  try {
    if (body.action === "reset") {
      const result = await resetPassword(body.userId)
      return success({ temporaryPassword: result.temporaryPassword })
    }

    if (body.action === "revoke-mfa") {
      const result = await revokeMfaSessions(body.userId)
      return success({ success: result.success })
    }

    return error("Invalid action. Use 'reset' or 'revoke-mfa'")
  } catch (e: unknown) {
    return error(e instanceof Error ? e.message : "Unable to execute the action")
  }
})

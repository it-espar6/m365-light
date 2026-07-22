import { withAuth, success, error } from "@/lib/api-utils"
import { getAuditLogs } from "@/lib/audit"

export const GET = withAuth(async () => {
  try {
    const logs = getAuditLogs()
    return success(logs)
  } catch {
    return error("Unable to fetch audit logs")
  }
})

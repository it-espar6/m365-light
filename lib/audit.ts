import fs from "fs"
import path from "path"

const AUDIT_DIR = path.join(process.cwd(), ".audit-logs")
const AUDIT_FILE = path.join(AUDIT_DIR, "audit.jsonl")

export interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  action: string
  target: string
  targetId?: string
}

function ensureDir() {
  if (!fs.existsSync(AUDIT_DIR)) {
    fs.mkdirSync(AUDIT_DIR, { recursive: true })
  }
}

export function audit(action: string, actor: string, target: string, targetId?: string) {
  try {
    ensureDir()
    const entry: AuditEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      target,
      targetId,
    }
    fs.appendFileSync(AUDIT_FILE, JSON.stringify(entry) + "\n")
  } catch {
    // silently fail — auditing should never block the main operation
  }
}

export function getAuditLogs(limit = 200): AuditEntry[] {
  try {
    ensureDir()
    if (!fs.existsSync(AUDIT_FILE)) return []
    const raw = fs.readFileSync(AUDIT_FILE, "utf-8").trim()
    if (!raw) return []
    const entries: AuditEntry[] = raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line))
    return entries.reverse().slice(0, limit)
  } catch {
    return []
  }
}

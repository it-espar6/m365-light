"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useApi } from "@/hooks/use-api"
import { RefreshCw } from "lucide-react"

interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  action: string
  target: string
  targetId?: string
}

const actionLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  "user.create": { label: "User Created", variant: "default" },
  "user.update": { label: "User Updated", variant: "secondary" },
  "user.delete": { label: "User Deleted", variant: "destructive" },
  "password.reset": { label: "Password Reset", variant: "outline" },
  "mfa.revoke": { label: "MFA Revoked", variant: "destructive" },
  "license.assign": { label: "License Assigned", variant: "default" },
  "license.remove": { label: "License Removed", variant: "destructive" },
  "group.create": { label: "Group Created", variant: "default" },
  "group.update": { label: "Group Updated", variant: "secondary" },
  "group.delete": { label: "Group Deleted", variant: "destructive" },
  "group.member.add": { label: "Member Added", variant: "default" },
  "group.member.remove": { label: "Member Removed", variant: "destructive" },
}

export default function AuditPage() {
  const { data: logs, loading, error, refetch } = useApi<AuditEntry[]>("/api/audit")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            Track admin actions across the tenant
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : logs && logs.length > 0 ? (
              logs.map((entry) => {
                const meta = actionLabels[entry.action] ?? { label: entry.action, variant: "outline" as const }
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={meta.variant} className="text-xs">
                        {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{entry.actor}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {entry.target}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  No audit entries yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

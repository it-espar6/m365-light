"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { useApi } from "@/hooks/use-api"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

interface Group {
  id: string
  displayName: string
  description?: string
  visibility?: string
}

export default function GroupsPage() {
  const [search, setSearch] = useState("")
  const baseUrl = "/api/groups?search=GGA-"
  const { data: groups, loading, error } = useApi<Group[]>(
    search ? `${baseUrl}&q=${encodeURIComponent(search)}` : baseUrl
  )
  const sortedGroups = groups?.slice().sort((a, b) => a.displayName.localeCompare(b.displayName))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Groups</h1>
        <p className="text-sm text-muted-foreground">
          Manage the security groups in your tenant
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search groups…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Visibility</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : sortedGroups && sortedGroups.length > 0 ? (
              sortedGroups.map((group) => (
                <TableRow
                  key={group.id}
                  className="cursor-pointer"
                  onClick={() => window.location.href = `/dashboard/groups/${group.id}`}
                >
                  <TableCell className="font-medium">
                    {group.displayName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {group.description || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {group.visibility ?? "Private"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                  No groups found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

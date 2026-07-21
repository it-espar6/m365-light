"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useAppStore } from "@/lib/store"
import type { User } from "@/lib/types"
import { Plus, Search, UsersIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const { data: users, loading, error } = useApi<User[]>(
    `/api/users${search ? `?search=${encodeURIComponent(search)}` : ""}`
  )
  const totalUsers = useAppStore((s) => s.users.length)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Users</h1>
          <Badge variant="outline" className="gap-1 px-3 py-1 text-sm">
            <UsersIcon className="size-3.5" />
            {totalUsers > 0 ? totalUsers : users?.length ?? 0}
          </Badge>
        </div>
        <Link href="/dashboard/users/new">
          <Button>
            <Plus className="size-4" />
            New User
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users…"
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
              <TableHead>Email</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.displayName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.mail ?? user.userPrincipalName}
                  </TableCell>
                  <TableCell>{user.country || "—"}</TableCell>
                  <TableCell>{user.state || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={user.accountEnabled !== false ? "default" : "secondary"}>
                      {user.accountEnabled !== false ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/users/${user.id}`}>
                      <Button variant="ghost" size="sm">Details</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

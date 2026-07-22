"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, UserPlus, Trash2, Search } from "lucide-react"
import { useApi, useMutation } from "@/hooks/use-api"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { User } from "@/lib/types"

interface GroupMember {
  id: string
  displayName: string
  mail?: string
  userPrincipalName: string
}

interface Group {
  id: string
  displayName: string
  description?: string
  visibility?: string
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const { data: group } = useApi<Group>(`/api/groups?id=${id}`)
  const { data: members, loading: membersLoading, refetch: refetchMembers } = useApi<GroupMember[]>(`/api/groups/${id}/members`)
  const { mutate: addMember, loading: adding } = useMutation(`/api/groups/${id}/members`)
  const [addOpen, setAddOpen] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const { data: searchResults } = useApi<User[]>(
    userSearch ? `/api/users?search=${encodeURIComponent(userSearch)}` : ""
  )
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [removing, setRemoving] = useState(false)

  async function handleAdd(userId: string) {
    const result = await addMember("POST", { userId })
    if (result) {
      toast({ title: "Member added" })
      setAddOpen(false)
      setUserSearch("")
      refetchMembers()
    }
  }

  async function handleRemove(userId: string) {
    setRemoving(true)
    const res = await fetch(`/api/groups/${id}/members?userId=${encodeURIComponent(userId)}`, {
      method: "DELETE",
    })
    await res.json()
    if (res.ok) {
      toast({ title: "Member removed" })
      setConfirmRemove(null)
      refetchMembers()
    }
    setRemoving(false)
  }

  const filteredResults = searchResults?.filter(
    (u) => !members?.some((m) => m.id === u.id)
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{group?.displayName ?? id}</CardTitle>
          <CardDescription>{group?.description || "—"}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              {members?.length ?? 0} member{(members?.length ?? 0) > 1 ? "s" : ""}
            </CardDescription>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary text-primary-foreground text-sm font-medium whitespace-nowrap h-9 gap-1.5 px-2.5 hover:bg-primary/80">
              <UserPlus className="size-4" />
              Add Member
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a member</DialogTitle>
                <DialogDescription>
                  Search for a user to add to the group.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users…"
                    className="pl-9"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-60 space-y-1 overflow-y-auto">
                  {filteredResults && filteredResults.length > 0 ? (
                    filteredResults.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted"
                      >
                        <div>
                          <p className="text-sm font-medium">{u.displayName}</p>
                          <p className="text-xs text-muted-foreground">{u.mail ?? u.userPrincipalName}</p>
                        </div>
                        <Button size="sm" onClick={() => handleAdd(u.id)} disabled={adding}>
                          Add
                        </Button>
                      </div>
                    ))
                  ) : userSearch ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No users found
                    </p>
                  ) : (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Type to search
                    </p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          {membersLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : members && members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.displayName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.mail ?? member.userPrincipalName}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setConfirmRemove(member.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No members in this group
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!confirmRemove} onOpenChange={(o) => !o && setConfirmRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member from the group?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmRemove && handleRemove(confirmRemove)}
              disabled={removing}
            >
              {removing ? "Deleting…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

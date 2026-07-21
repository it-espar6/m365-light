"use client"

import { useState } from "react"
import { Mail, List, Plus, Trash2, ChevronDown, ChevronRight, Users } from "lucide-react"
import { useApi, useMutation } from "@/hooks/use-api"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface SharedMailbox {
  id: string
  displayName: string
  mail: string
  mailNickname: string
}

interface DistributionList {
  id: string
  displayName: string
  mail: string
  mailNickname: string
  memberCount?: number
}

interface DLMember {
  id: string
  displayName: string
  mail?: string
  userPrincipalName: string
}

function MailboxSection() {
  const { toast } = useToast()
  const { data: mailboxes, loading, refetch } = useApi<SharedMailbox[]>("/api/exchange/mailboxes")
  const { mutate: create, loading: creating } = useMutation("/api/exchange/mailboxes")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ displayName: "", mailNickname: "" })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [removing, setRemoving] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const result = await create("POST", form)
    if (result) {
      toast({ title: "Mailbox created" })
      setShowForm(false)
      setForm({ displayName: "", mailNickname: "" })
      refetch()
    }
  }

  async function handleDelete(id: string) {
    setRemoving(true)
    const res = await fetch(`/api/exchange/mailboxes?id=${encodeURIComponent(id)}`, { method: "DELETE" })
    await res.json()
    if (res.ok) {
      toast({ title: "Mailbox deleted" })
      setDeleteId(null)
      refetch()
    }
    setRemoving(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Mail className="size-4" />
            Shared Mailboxes
          </CardTitle>
          <CardDescription>{mailboxes?.length ?? 0} mailboxes</CardDescription>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4" />
          New
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {showForm && (
          <form onSubmit={handleCreate} className="border-b p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="mb-name">Display Name</Label>
                <Input id="mb-name" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="mb-nick">Mail Nickname</Label>
                <Input id="mb-nick" value={form.mailNickname} onChange={(e) => setForm((f) => ({ ...f, mailNickname: e.target.value }))} required />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={creating} className="w-full">
                  {creating ? "…" : "Create"}
                </Button>
              </div>
            </div>
          </form>
        )}
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : mailboxes && mailboxes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mailboxes.map((mb) => (
                <TableRow key={mb.id}>
                  <TableCell className="font-medium">{mb.displayName}</TableCell>
                  <TableCell className="text-muted-foreground">{mb.mail}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(mb.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No shared mailboxes
          </div>
        )}
      </CardContent>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>This action is irreversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)} disabled={removing}>
              {removing ? "…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function DistributionListsSection() {
  const { toast } = useToast()
  const { data: lists, loading, refetch } = useApi<DistributionList[]>("/api/exchange/distribution-lists")
  const { mutate: create, loading: creating } = useMutation("/api/exchange/distribution-lists")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ displayName: "", mailNickname: "", description: "" })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [removing, setRemoving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [members, setMembers] = useState<Record<string, DLMember[]>>({})
  const [membersLoading, setMembersLoading] = useState<Record<string, boolean>>({})

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const result = await create("POST", form)
    if (result) {
      toast({ title: "Distribution list created" })
      setShowForm(false)
      setForm({ displayName: "", mailNickname: "", description: "" })
      refetch()
    }
  }

  async function handleDelete(id: string) {
    setRemoving(true)
    const res = await fetch(`/api/exchange/distribution-lists?id=${encodeURIComponent(id)}`, { method: "DELETE" })
    await res.json()
    if (res.ok) {
      toast({ title: "List deleted" })
      setDeleteId(null)
      refetch()
    }
    setRemoving(false)
  }

  async function toggleExpand(listId: string) {
    if (expandedId === listId) {
      setExpandedId(null)
      return
    }
    setExpandedId(listId)
    if (!members[listId]) {
      setMembersLoading((prev) => ({ ...prev, [listId]: true }))
      try {
        const res = await fetch(`/api/exchange/distribution-lists/members?groupId=${listId}`)
        const json = await res.json()
        setMembers((prev) => ({ ...prev, [listId]: json.data ?? [] }))
      } catch {
        // ignore
      } finally {
        setMembersLoading((prev) => ({ ...prev, [listId]: false }))
      }
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <List className="size-4" />
            Distribution Lists
          </CardTitle>
          <CardDescription>{lists?.length ?? 0} lists</CardDescription>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4" />
          New
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {showForm && (
          <form onSubmit={handleCreate} className="border-b p-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <Label htmlFor="dl-name">Display Name</Label>
                <Input id="dl-name" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dl-nick">Mail Nickname</Label>
                <Input id="dl-nick" value={form.mailNickname} onChange={(e) => setForm((f) => ({ ...f, mailNickname: e.target.value }))} required />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="dl-desc">Description</Label>
                <Input id="dl-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <Button type="submit" disabled={creating} className="mt-3">
              {creating ? "…" : "Create"}
            </Button>
          </form>
        )}
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : lists && lists.length > 0 ? (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lists.map((dl) => (
                  <>
                    <TableRow key={dl.id} className="cursor-pointer" onClick={() => toggleExpand(dl.id)}>
                      <TableCell>
                        {expandedId === dl.id ? (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{dl.displayName}</TableCell>
                      <TableCell className="text-muted-foreground">{dl.mail}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <Users className="size-3" />
                          {dl.memberCount ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(dl.id) }}>
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedId === dl.id && (
                      <TableRow key={`${dl.id}-members`}>
                        <TableCell colSpan={5} className="bg-muted/50 p-4">
                          {membersLoading[dl.id] ? (
                            <div className="space-y-2">
                              <Skeleton className="h-8 w-full" />
                              <Skeleton className="h-8 w-full" />
                            </div>
                          ) : members[dl.id] && members[dl.id].length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Email</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {members[dl.id].map((m) => (
                                  <TableRow key={m.id}>
                                    <TableCell className="font-medium">{m.displayName}</TableCell>
                                    <TableCell className="text-muted-foreground">{m.mail ?? m.userPrincipalName}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                              No members
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No distribution lists
          </div>
        )}
      </CardContent>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>This action is irreversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)} disabled={removing}>
              {removing ? "…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default function ExchangePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Exchange</h1>
        <p className="text-sm text-muted-foreground">
          Manage shared mailboxes and distribution lists.
        </p>
      </div>
      <MailboxSection />
      <DistributionListsSection />
    </div>
  )
}

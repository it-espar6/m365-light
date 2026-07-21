"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import type { User } from "@/lib/types"

const stateOptions = ["FR", "CI", "CAM", "LIB", "MAU", "RDC", "SEN"]

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState<User | null>(null)
  const [form, setForm] = useState({
    givenName: "",
    surname: "",
    country: "",
    state: "",
  })

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then((res) => {
        const u = res.data as User
        setUserData(u)
        const [givenName = "", surname = ""] = (u.displayName ?? "").split(" ")
        setForm({
          givenName,
          surname,
          country: u.country ?? "",
          state: u.state ?? "",
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          displayName: `${form.givenName} ${form.surname}`.trim(),
        }),
      })
      const json = await res.json()
      if (res.ok) {
        toast({ title: "User updated" })
        router.push(`/dashboard/users/${id}`)
      } else {
        toast({ title: json.error ?? "Failed to update user" })
      }
    } catch {
      toast({ title: "Network error" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit user</CardTitle>
          <CardDescription>Update user properties</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {userData && (
              <div className="rounded-md border bg-muted/50 px-3 py-2 space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">UPN</span>
                  <p className="break-all">{userData.userPrincipalName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Primary Email</span>
                  <p className="break-all">{userData.mail || "—"}</p>
                </div>
                {userData.otherMails && userData.otherMails.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Other Emails</span>
                    <ul className="list-inside list-disc">
                      {userData.otherMails.map((e, i) => (
                        <li key={i} className="break-all">{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="givenName">First Name</Label>
                <Input
                  id="givenName"
                  value={form.givenName}
                  onChange={(e) => setForm((f) => ({ ...f, givenName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Last Name</Label>
                <Input
                  id="surname"
                  value={form.surname}
                  onChange={(e) => setForm((f) => ({ ...f, surname: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State / Province</Label>
              <Select
                value={form.state}
                onValueChange={(v) => setForm((f) => ({ ...f, state: v ?? "" }))}
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

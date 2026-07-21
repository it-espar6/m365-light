"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMutation } from "@/hooks/use-api"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const countries = [
  "France",
  "Côte d'Ivoire",
  "Senegal",
  "Mauritanie",
  "Liban",
  "Congo (RDC)",
  "Cameroun",
]

export default function NewUserPage() {
  const router = useRouter()
  const { mutate, loading, error } = useMutation<{ user: unknown; temporaryPassword: string }>("/api/users")
  const [result, setResult] = useState<{ temporaryPassword: string } | null>(null)
  const [form, setForm] = useState({
    givenName: "",
    surname: "",
    mailNickname: "",
    country: "",
    state: "",
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = await mutate("POST", {
      ...form,
      displayName: `${form.givenName} ${form.surname}`.trim(),
    })
    if (data) {
      setResult({ temporaryPassword: data.temporaryPassword })
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User created</CardTitle>
            <CardDescription>
              The user has been created successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Temporary password</Label>
              <div className="mt-1 rounded-md border bg-muted px-3 py-2 font-mono text-sm">
                {result.temporaryPassword}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Copy this password. It will not be shown again.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/users")}>
              Back to list
            </Button>
          </CardFooter>
        </Card>
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
          <CardTitle>New user</CardTitle>
          <CardDescription>
            Create a new user in your Microsoft 365 tenant.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="givenName">First Name</Label>
                <Input
                  id="givenName"
                  value={form.givenName}
                  onChange={(e) => update("givenName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Last Name</Label>
                <Input
                  id="surname"
                  value={form.surname}
                  onChange={(e) => update("surname", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mailNickname">Username</Label>
              <Input
                id="mailNickname"
                value={form.mailNickname}
                onChange={(e) => update("mailNickname", e.target.value)}
                placeholder="jdoe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={form.country} onValueChange={(v) => update("country", v ?? "")}>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State / Province</Label>
              <Select value={form.state} onValueChange={(v) => update("state", v ?? "")}>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {["FR", "CI", "CAM", "LIB", "MAU", "RDC", "SEN"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.mailNickname && (
              <div className="rounded-md border bg-muted/50 px-3 py-2 space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">UPN</span>
                  <p className="break-all">{form.mailNickname}@yourtenant.com</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Primary Email</span>
                  <p className="break-all">{form.mailNickname}@yourtenant.com</p>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating…" : "Create user"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

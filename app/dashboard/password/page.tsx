"use client"

import { useState } from "react"
import { Search, KeyRound, ShieldOff } from "lucide-react"
import { useApi, useMutation } from "@/hooks/use-api"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
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

export default function PasswordPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showResults, setShowResults] = useState(false)
  const { data: users } = useApi<User[]>(
    search ? `/api/users?search=${encodeURIComponent(search)}` : ""
  )
  const { mutate: passwordAction, loading } = useMutation("/api/password")
  const [tempPw, setTempPw] = useState<string | null>(null)
  const [revokeOpen, setRevokeOpen] = useState(false)

  async function handleReset() {
    if (!selectedUser) return
    const result = await passwordAction("POST", {
      userId: selectedUser.id,
      action: "reset",
    })
    if (result) {
      setTempPw((result as { temporaryPassword: string }).temporaryPassword)
      toast({ title: "Mot de passe réinitialisé" })
    }
  }

  async function handleRevokeMfa() {
    if (!selectedUser) return
    const result = await passwordAction("POST", {
      userId: selectedUser.id,
      action: "revoke-mfa",
    })
    if (result) {
      toast({ title: "Sessions MFA révoquées" })
      setRevokeOpen(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Password &amp; MFA</h1>
        <p className="text-sm text-muted-foreground">
          Reset passwords and revoke MFA sessions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search for a user</CardTitle>
          <CardDescription>
            Find the user you want to act on.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users…"
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowResults(true); setSelectedUser(null) }}
            />
          </div>

          {showResults && search && users && users.length > 0 && !selectedUser && (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => { setSelectedUser(u); setShowResults(false) }}
                >
                  <div>
                    <p className="font-medium">{u.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.mail ?? u.userPrincipalName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showResults && search && users && users.length === 0 && (
            <p className="py-2 text-center text-sm text-muted-foreground">
              Aucun utilisateur trouvé
            </p>
          )}

          {selectedUser && (
            <div className="rounded-md border bg-muted p-3">
              <Label>Selected user</Label>
              <p className="mt-1 text-sm font-medium">{selectedUser.displayName}</p>
              <p className="text-xs text-muted-foreground">
                {selectedUser.mail ?? selectedUser.userPrincipalName}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => { setSelectedUser(null); setSearch(""); setTempPw(null) }}
              >
                Changer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={handleReset}
                disabled={loading}
              >
                <KeyRound className="size-4" />
                Reset Password
              </Button>
              <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
                <DialogTrigger className="inline-flex w-full items-center justify-center rounded-md border border-border bg-background text-sm font-medium whitespace-nowrap h-9 gap-1.5 px-2.5 shadow-xs hover:bg-muted hover:text-foreground">
                  <ShieldOff className="size-4" />
                  Revoke MFA
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm MFA revocation</DialogTitle>
                    <DialogDescription>
Are you sure you want to revoke all MFA sessions
                       of {selectedUser.displayName}?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setRevokeOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleRevokeMfa}
                      disabled={loading}
                    >
                      Confirmer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {tempPw && (
            <Card>
              <CardHeader>
                <CardTitle>Mot de passe temporaire</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border bg-muted px-3 py-2 font-mono text-sm">
                  {tempPw}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Copiez ce mot de passe. Il ne sera plus affiché.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  onClick={() => setTempPw(null)}
                >
                  Fermer
                </Button>
              </CardFooter>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { useApi, useMutation } from "@/hooks/use-api"
import { useGroups } from "@/hooks/use-dashboard-data"
import type { User } from "@/lib/types"
import { ArrowLeft, KeyRound, Plus, Search, Shield, ShieldOff, Tag, Trash2, X } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import useSWR from "swr"

interface Group {
  id: string
  displayName: string
  description?: string
}

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((r) => r.json()).then((d) => d.data as T)

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const { data: user, loading, error } = useApi<User>(`/api/users/${id}`)
  const { mutate: deleteUser, loading: deleting } = useMutation(`/api/users/${id}`)
  const { mutate: passwordAction, loading: pwLoading } = useMutation("/api/password")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pwResult, setPwResult] = useState<string | null>(null)

  const { data: userGroups, isLoading: groupsLoading, mutate: mutateUserGroups } = useSWR<Group[]>(`/api/users/${id}/groups`, fetcher)
  const { data: allGroups } = useGroups()
  const { mutate: assignGroup } = useMutation(`/api/users/${id}/groups`)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [groupSearch, setGroupSearch] = useState("")

  interface ServicePlan {
    servicePlanId: string
    servicePlanName: string
    provisioningStatus?: string
  }

  interface AssignedLicense {
    id: string
    skuId: string
    skuPartNumber: string
    servicePlans: ServicePlan[]
  }

  interface AvailableSku {
    id: string
    skuId: string
    skuPartNumber: string
    consumedUnits: number
    prepaidUnits: { enabled: number }
    servicePlans: ServicePlan[]
  }

  interface LicenseData {
    userLicenses: AssignedLicense[]
    availableSkus: AvailableSku[]
  }
  const targetSkus = ["O365_BUSINESS_PREMIUM", "O365_BUSINESS_ESSENTIALS"]
  const { data: licenseData, isLoading: licLoading, mutate: mutateLicenses } = useSWR<LicenseData>(`/api/users/${id}/licenses`, fetcher)
  const filteredLicenses = licenseData ? {
    userLicenses: licenseData.userLicenses.filter((l) => targetSkus.includes(l.skuPartNumber)),
    availableSkus: licenseData.availableSkus.filter((s) => targetSkus.includes(s.skuPartNumber)),
  } : null
  const [licensing, setLicensing] = useState<string | null>(null)
  const [assignDialog, setAssignDialog] = useState<AvailableSku | null>(null)
  const [disabledPlans, setDisabledPlans] = useState<string[]>([])

  const sortByName = (a: Group, b: Group) => a.displayName.localeCompare(b.displayName)
  const sortedUserGroups = userGroups?.slice().sort(sortByName)
  const filteredGroups = allGroups?.filter((g) =>
    !groupSearch ||
    g.displayName.toLowerCase().includes(groupSearch.toLowerCase())
  ).sort(sortByName)

  async function handleAssignGroup(groupId: string) {
    setAssigning(groupId)
    const result = await assignGroup("POST", { groupId })
    if (result) {
      toast({ title: "Group assigned" })
      mutateUserGroups()
    }
    setAssigning(null)
  }

  async function handleUnassignGroup(groupId: string) {
    setAssigning(groupId)
    const res = await fetch(`/api/users/${id}/groups?groupId=${encodeURIComponent(groupId)}`, { method: "DELETE" })
    await res.json()
    if (res.ok) {
      toast({ title: "Group unassigned" })
      mutateUserGroups()
    }
    setAssigning(null)
  }

  async function handleDelete() {
    const result = await deleteUser("DELETE")
    if (result) {
      toast({ title: "User deleted" })
      router.push("/dashboard/users")
    }
  }

  async function handleResetPassword() {
    const result = await passwordAction("POST", { userId: id, action: "reset" })
    if (result) {
      setPwResult((result as { temporaryPassword: string }).temporaryPassword)
      toast({ title: "Password reset" })
    }
  }

  async function handleRevokeMfa() {
    const result = await passwordAction("POST", { userId: id, action: "revoke-mfa" })
    if (result) {
      toast({ title: "MFA sessions revoked" })
    }
  }

  async function handleAssignLicense(skuId: string, plansToDisable: string[]) {
    setLicensing(skuId)
    try {
      const res = await fetch(`/api/users/${id}/licenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addLicenses: [{ skuId, disabledPlans: plansToDisable }], removeLicenses: [] }),
      })
      const json = await res.json()
      if (res.ok) {
        toast({ title: "License assigned" })
        setAssignDialog(null)
        setDisabledPlans([])
        mutateLicenses()
      } else {
        toast({ title: json.error ?? "Failed to assign license" })
      }
    } catch {
      toast({ title: "Network error" })
    } finally {
      setLicensing(null)
    }
  }

  async function handleRemoveLicense(skuId: string) {
    setLicensing(skuId)
    try {
      const res = await fetch(`/api/users/${id}/licenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addLicenses: [], removeLicenses: [skuId] }),
      })
      const json = await res.json()
      if (res.ok) {
        toast({ title: "License removed" })
        mutateLicenses()
      } else {
        toast({ title: json.error ?? "Failed to remove license" })
      }
    } catch {
      toast({ title: "Network error" })
    } finally {
      setLicensing(null)
    }
  }

  function openAssignDialog(sku: AvailableSku) {
    setAssignDialog(sku)
                            const alreadyDisabled = filteredLicenses?.userLicenses
      ?.find((l) => l.skuId === sku.skuId)
      ?.servicePlans
      ?.filter((p) => p.provisioningStatus === "Disabled")
      ?.map((p) => p.servicePlanId) ?? []
    setDisabledPlans(alreadyDisabled)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {error ?? "User not found"}
      </div>
    )
  }


  console.log(licenseData)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{user.displayName}</CardTitle>
            <CardDescription>{user.mail ?? user.userPrincipalName}</CardDescription>
          </div>
          <Badge variant={user.accountEnabled !== false ? "default" : "secondary"}>
            {user.accountEnabled !== false ? "Active" : "Disabled"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground">UPN</span>
              <p className="break-all">{user.userPrincipalName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Primary Email</span>
              <p className="break-all">{user.mail || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Country</span>
              <p>{user.country || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">State</span>
              <p>{user.state || "—"}</p>
            </div>
          </div>
          {user.otherMails && user.otherMails.length > 0 && (
            <div>
              <span className="text-muted-foreground">Other Emails</span>
              <ul className="mt-1 space-y-0.5">
                {user.otherMails.map((e, i) => (
                  <li key={i} className="break-all">{e}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Link href={`/dashboard/users/${id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button variant="outline" onClick={handleResetPassword} disabled={pwLoading}>
            <KeyRound className="size-4" />
            Reset Password
          </Button>
          <Button variant="outline" onClick={handleRevokeMfa} disabled={pwLoading}>
            <ShieldOff className="size-4" />
            Revoke MFA
          </Button>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-md border border-transparent bg-destructive/10 text-destructive text-sm font-medium whitespace-nowrap h-9 gap-1.5 px-2.5 hover:bg-destructive/20">
              <Trash2 className="size-4" />
              Delete
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {user.displayName}?
                  This action is irreversible.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-4" />
            Groups
          </CardTitle>
          <CardDescription>
            {groupsLoading
              ? "Loading…"
              : `${userGroups?.length ?? 0} group${(userGroups?.length ?? 0) !== 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groupsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-32" />
            </div>
          ) : sortedUserGroups && sortedUserGroups.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {sortedUserGroups.map((g) => (
                <Badge key={g.id} variant="secondary" className="gap-1 px-3 py-1">
                  <Shield className="size-3" />
                  {g.displayName}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not a member of any group</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Groups</CardTitle>
          <CardDescription>Assign or unassign security groups</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search groups…"
              className="pl-9"
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
            />
          </div>
          {allGroups && allGroups.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No groups available
            </p>
          ) : filteredGroups && filteredGroups.length > 0 ? (
            filteredGroups.map((g) => {
              const isMember = userGroups?.some((ug) => ug.id === g.id)
              const isBusy = assigning === g.id
              return (
                <div
                  key={g.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{g.displayName}</p>
                    {g.description && (
                      <p className="text-xs text-muted-foreground truncate">{g.description}</p>
                    )}
                  </div>
                  {isMember ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive shrink-0"
                      onClick={() => handleUnassignGroup(g.id)}
                      disabled={isBusy}
                    >
                      <X className="size-4" />
                      Unassign
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => handleAssignGroup(g.id)}
                      disabled={isBusy}
                    >
                      <Plus className="size-4" />
                      Assign
                    </Button>
                  )}
                </div>
              )
            })
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {groupSearch ? "No groups match your search" : "No groups available"}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="size-4" />
            Licenses
          </CardTitle>
          <CardDescription>
            {licLoading ? "Loading…" : `${filteredLicenses?.userLicenses.length ?? 0} assigned`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {licLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <>
              {filteredLicenses && filteredLicenses.userLicenses.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Assigned licenses
                  </p>
                  {filteredLicenses.userLicenses.map((lic) => {
                    const sku = filteredLicenses?.availableSkus.find((s) => s.skuId === lic.skuId)
                    return (
                      <div key={lic.id} className="rounded-md border p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{sku?.skuPartNumber ?? lic.skuPartNumber}</p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleRemoveLicense(lic.skuId)}
                              disabled={licensing === lic.skuId}
                            >
                              {licensing === lic.skuId ? "…" : <X className="size-3.5" />}
                              Remove
                            </Button>
                          </div>
                        </div>
                        {lic.servicePlans.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {lic.servicePlans.slice(0, 10).map((plan) => (
                              <Badge
                                key={plan.servicePlanId}
                                variant={plan.provisioningStatus === "Disabled" ? "outline" : "secondary"}
                                className="text-[10px]"
                              >
                                {plan.servicePlanName}
                              </Badge>
                            ))}
                            {lic.servicePlans.length > 10 && (
                              <Badge variant="outline" className="text-[10px]">
                                +{lic.servicePlans.length - 10} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {filteredLicenses && filteredLicenses.availableSkus.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Available licenses
                  </p>
                  {filteredLicenses.availableSkus.map((sku) => {
                    const hasLicense = filteredLicenses.userLicenses.some((l) => l.skuId === sku.skuId)
                    const remaining = sku.prepaidUnits.enabled - sku.consumedUnits
                    const isBusy = licensing === sku.skuId
                    return (
                      <div
                        key={sku.skuId}
                        className={`flex items-center justify-between rounded-md border px-3 py-2 ${hasLicense ? "bg-muted/30" : ""}`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{sku.skuPartNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {remaining > 0 ? `${remaining} available` : "Fully used"}
                          </p>
                        </div>
                        {hasLicense ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive shrink-0"
                            onClick={() => handleRemoveLicense(sku.skuId)}
                            disabled={isBusy}
                          >
                            {isBusy ? "…" : <X className="size-3.5" />}
                            Remove
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={() => openAssignDialog(sku)}
                            disabled={isBusy || remaining <= 0}
                          >
                            <Plus className="size-3.5" />
                            Assign
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {(!filteredLicenses || (filteredLicenses.userLicenses.length === 0 && filteredLicenses.availableSkus.length === 0)) && (
                <p className="text-sm text-muted-foreground">No license information available</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!assignDialog} onOpenChange={(o) => { if (!o) { setAssignDialog(null); setDisabledPlans([]) } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign license</DialogTitle>
            <DialogDescription>
              {assignDialog?.skuPartNumber} — choose service plans to disable.
            </DialogDescription>
          </DialogHeader>
          {assignDialog && (
            <div className="max-h-80 space-y-1 overflow-y-auto">
              {assignDialog.servicePlans.map((plan) => {
                const isDisabled = disabledPlans.includes(plan.servicePlanId)
                return (
                  <div
                    key={plan.servicePlanId}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer"
                    onClick={() => {
                      setDisabledPlans((prev) =>
                        isDisabled
                          ? prev.filter((id) => id !== plan.servicePlanId)
                          : [...prev, plan.servicePlanId]
                      )
                    }}
                  >
                    <div
                      className={`size-4 shrink-0 rounded border ${isDisabled ? "bg-destructive border-destructive" : "border-input"} flex items-center justify-center`}
                    >
                      {isDisabled && <X className="size-3 text-destructive-foreground" />}
                    </div>
                    <span className={`text-sm ${isDisabled ? "text-muted-foreground line-through" : ""}`}>
                      {plan.servicePlanName}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAssignDialog(null); setDisabledPlans([]) }}>
              Cancel
            </Button>
            <Button
              onClick={() => assignDialog && handleAssignLicense(assignDialog.skuId, disabledPlans)}
              disabled={licensing === assignDialog?.skuId}
            >
              {licensing === assignDialog?.skuId ? "Assigning…" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {pwResult && (
        <Card>
          <CardHeader>
            <CardTitle>Temporary password</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border bg-muted px-3 py-2 font-mono text-sm">
              {pwResult}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Copy this password. It will not be shown again.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

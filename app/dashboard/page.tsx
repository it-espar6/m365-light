"use client"

import { useSession } from "next-auth/react"
import { useAllDashboardData } from "@/hooks/use-dashboard-data"
import { useAppStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Shield, Tag } from "lucide-react"

export default function DashboardPage() {
  const { data: session } = useSession()
  const { loading } = useAllDashboardData()

  const userCount = useAppStore((s) => s.users.length)
  const groupCount = useAppStore((s) => s.groups.length)
  const licenses = useAppStore((s) => s.licenses)

  const stats = [
    { label: "Users", icon: Users, value: userCount, desc: "Total users" },
    { label: "Groups", icon: Shield, value: groupCount, desc: "Security groups" },
  ]

  const premium = licenses.find((l) => l.skuPartNumber === "O365_BUSINESS_PREMIUM")
  const essentials = licenses.find((l) => l.skuPartNumber === "O365_BUSINESS_ESSENTIALS")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome {session?.user?.name ?? "—"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of your Microsoft 365 tenant
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <s.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{s.value}</div>
              )}
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold">Licenses</h2>
        <p className="text-sm text-muted-foreground">Business Premium &amp; Essentials</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[premium, essentials].map((lic) =>
          lic ? (
            <Card key={lic.skuPartNumber}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{lic.skuPartNumber}</CardTitle>
                <Tag className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{lic.consumed}</span>
                    <span className="text-sm text-muted-foreground">/ {lic.total} assigned</span>
                  </div>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={lic.available > 0 ? "default" : "outline"} className="text-[10px]">
                    {lic.available} available
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : null
        )}
      </div>
    </div>
  )
}

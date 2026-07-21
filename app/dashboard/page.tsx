"use client"

import { useSession } from "next-auth/react"
import { useAllDashboardData } from "@/hooks/use-dashboard-data"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Shield, Mail, List } from "lucide-react"

export default function DashboardPage() {
  const { data: session } = useSession()
  const { loading } = useAllDashboardData()

  const userCount = useAppStore((s) => s.users.length)
  const groupCount = useAppStore((s) => s.groups.length)
  const mailboxCount = useAppStore((s) => s.mailboxes.length)
  const distListCount = useAppStore((s) => s.distLists.length)

  const stats = [
    { label: "Users", icon: Users, value: userCount, desc: "Total users" },
    { label: "Groups", icon: Shield, value: groupCount, desc: "Security groups" },
    { label: "Mailboxes", icon: Mail, value: mailboxCount, desc: "Shared mailboxes" },
    { label: "Dist. Lists", icon: List, value: distListCount, desc: "Distribution lists" },
  ]

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
    </div>
  )
}

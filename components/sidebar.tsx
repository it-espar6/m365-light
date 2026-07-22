"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPopup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  History,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Shield,
  Sun,
  Users,
  X,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/groups", label: "Groups", icon: Shield },
  { href: "/dashboard/password", label: "Password & MFA", icon: KeyRound },
  { href: "/dashboard/audit", label: "Audit Log", icon: History },
  // { href: "/dashboard/exchange", label: "Exchange", icon: Mail },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session?.user?.email?.charAt(0).toUpperCase() ?? "?"

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex h-svh w-64 flex-col border-r bg-sidebar transition-transform duration-200 lg:sticky lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <ChevronLeft className="size-5 text-sidebar-primary" />
          <span className="text-sm font-semibold text-sidebar-foreground">
            m365 Light
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground">
              <Avatar className="size-7">
                <AvatarImage src={session?.user?.image ?? undefined} alt={session?.user?.name ?? ""} />
                <AvatarFallback delay={100}>{initials}</AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate text-left">
                {session?.user?.name ?? session?.user?.email ?? "User"}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuPopup>
              <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuPopup>
          </DropdownMenu>
        </div>
      </aside>
    </>
  )
}

import { Sidebar } from "@/components/sidebar"
import { SessionProvider } from "@/components/session-provider"
import { ToastProvider, Toaster } from "@/components/ui/toast"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <ToastProvider>
        <div className="flex min-h-svh">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
        <Toaster />
      </ToastProvider>
    </SessionProvider>
  )
}

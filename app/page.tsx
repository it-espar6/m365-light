import { getServerSession } from "next-auth/next"
import { redirect } from 'next/navigation'

export default async function Page() {
  const session = await getServerSession()
  if (session && session?.expires > new Date().toISOString())
    redirect("/dashboard")

  redirect("/auth/login")
}

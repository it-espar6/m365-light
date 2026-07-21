import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token as { groups?: string[] } | null
    const allowedGroupId = process.env.AZURE_AD_GROUP_ID

    if (allowedGroupId && Array.isArray(token?.groups) && !token.groups.includes(allowedGroupId)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*"],
}

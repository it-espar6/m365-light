import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"

type NextAuthHandler<TParams extends Record<string, string>> = (
  session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>,
  req: NextRequest,
  params: TParams
) => Promise<NextResponse>

export function withAuth<TParams extends Record<string, string> = Record<string, string>>(
  handler: NextAuthHandler<TParams>
) {
  return async (
    req: NextRequest,
    context: { params: Promise<TParams> }
  ): Promise<NextResponse> => {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    const params = await context.params
    return handler(session, req, params)
  }
}

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function notAvailable() {
  return NextResponse.json(
    { error: "Exchange features are not available via the Graph API. Use the Exchange admin center instead." },
    { status: 403 }
  )
}

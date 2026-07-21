import { getServerSession } from "next-auth"
import { Client } from "@microsoft/microsoft-graph-client"

import { authOptions } from "@/lib/auth"

export async function getGraphClient() {
  const session = await getServerSession(authOptions)
  const token = session?.accessToken

  if (!token) {
    throw new Error("Not authenticated — Token missing")
  }

  return Client.init({
    authProvider: (done) => {
      done(null, token)
    },
  })
}

export function getGraphClientWithToken(accessToken: string) {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken)
    },
  })
}
import type { DefaultSession, NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"
import AzureADProvider from "next-auth/providers/azure-ad"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    idToken?: string
    refreshToken?: string
    expiresAt?: number
    groups?: string[]
    error?: string
  }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AZURE_AD_CLIENT_ID!,
        client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken!,
      }),
    })
    const refreshedTokens = await response.json()
    if (!response.ok) throw refreshedTokens

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      error: undefined,
    }
  } catch {
    return { ...token, error: "RefreshAccessTokenError" }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || "",
      authorization: {
        params: {
          scope:
            "openid profile email offline_access User.Read Group.Read.All User.ReadWrite.All GroupMember.ReadWrite.All",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at

        if (!token.groups) {
          try {
            const res = await fetch(
              "https://graph.microsoft.com/v1.0/me/memberOf?$select=id&$filter=securityEnabled eq true",
              { headers: { Authorization: `Bearer ${account.access_token}` } }
            )
            const data = await res.json()
            if (data.value) {
              token.groups = data.value.map(
                (g: { id: string }) => g.id
              )
            }
          } catch {
            // Group fetch failed — authorization will fall back to
            // app-manifest group claims or per-route checks.
          }
        }
        return token
      }

      if (token.expiresAt && Date.now() / 1000 > token.expiresAt) {
        return refreshAccessToken(token)
      }

      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

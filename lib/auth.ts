import type { DefaultSession, NextAuthOptions } from "next-auth"
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
    groups?: string[]
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
        token.idToken = account.id_token

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

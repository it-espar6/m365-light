// src/libs/auth.ts
import { NextAuthOptions } from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { checkAuthorizedGroup } from './graph/groups';

export const authOptions: NextAuthOptions = {
    providers: [
        AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID || '',
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
            tenantId: process.env.AZURE_AD_TENANT_ID || '',
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            /*
            if (session.user && token.sub) {
                session.user.id = token.sub;
                // On récupère les informations du user depuis Graph pour le scope
                const userDetails = await getUserDetails(token.sub, token.accessToken as string);
                session.user.country = userDetails.country;
                session.user.state = userDetails.state;
                session.user.groups = userDetails.groups;
            }
            */
            return session;
        },
        async signIn({ user, account, profile }) {
            // Vérifier que l'utilisateur appartient au groupe de sécurité autorisé
            //const isAuthorized = await checkAuthorizedGroup( as string, user.id);
            return true//isAuthorized;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};


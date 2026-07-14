// src/lib/graph/client.ts
import { getSession } from "@/lib/auth";
import { Client } from "@microsoft/microsoft-graph-client";

let graphClient: Client | null = null;
let currentToken: string | null = null;

/**
 * Récupère le client Graph initialisé avec le token de la session
 * Réutilise la même instance si le token n'a pas changé
 */
export async function getGraphClient() {
    const session = await getSession();

    if (!session?.user?.accessToken) {
        throw new Error("Non authentifié - Token manquant");
    }

    const token = session.user.accessToken as string;

    // Si le token a changé ou si le client n'existe pas, on le recrée
    if (!graphClient || currentToken !== token) {
        graphClient = Client.init({
            authProvider: (done) => {
                done(null, token);
            },
        });
        currentToken = token;

        console.log("✅ Client Graph initialisé avec nouveau token");
    }

    return graphClient;
}

/**
 * Initialise le client Graph avec un token spécifique (pour les API Routes)
 */
export function getGraphClientWithToken(accessToken: string) {
    return Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        },
    });
}

/**
 * Réinitialise le client Graph (utile pour les tests ou en cas d'erreur)
 */
export function resetGraphClient() {
    graphClient = null;
    currentToken = null;
    console.log("🔄 Client Graph réinitialisé");
}

/**
 * Vérifie si le client Graph est valide
 */
export function isGraphClientValid(): boolean {
    return graphClient !== null && currentToken !== null;
}
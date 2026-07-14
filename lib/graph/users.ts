/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/graph/users.ts
import type { User } from "@/lib/types";
import { getGraphClient } from "./client";

export interface CreateUserData {
    displayName: string;
    givenName: string;
    surname: string;
    mailNickname: string;
    country: string;
    state?: string;
    department?: string;
    jobTitle?: string;
    password?: string;
}

export interface UpdateUserData {
    displayName?: string;
    givenName?: string;
    surname?: string;
    department?: string;
    jobTitle?: string;
    country?: string;
    state?: string;
    accountEnabled?: boolean;
}

/**
 * Récupère tous les utilisateurs avec filtres optionnels
 */
export async function getUsers(filter?: string, search?: string) {
    try {
        const client = await getGraphClient();

        let query = client
            .api("/users")
            .select("id,displayName,mail,userPrincipalName,country,state,department,jobTitle,accountEnabled");

        if (filter) {
            query = query.filter(filter);
        }

        if (search) {
            query = query.filter(`startswith(displayName, '${search}') or startswith(mail, '${search}')`);
        }

        const response = await query.top(500).get();
        return response.value as User[];
    } catch (error) {
        console.error("❌ Erreur getUsers:", error);
        throw new Error("Impossible de récupérer les utilisateurs");
    }
}

/**
 * Récupère un utilisateur par son ID
 */
export async function getUserById(userId: string) {
    try {
        const client = await getGraphClient();

        const user = await client
            .api(`/users/${userId}`)
            .select("id,displayName,mail,userPrincipalName,country,state,department,jobTitle,accountEnabled")
            .get();

        return user as User;
    } catch (error) {
        console.error(`❌ Erreur getUserById (${userId}):`, error);
        throw new Error("Utilisateur non trouvé");
    }
}

/**
 * Crée un nouvel utilisateur
 */
export async function createUser(userData: CreateUserData) {
    try {
        const client = await getGraphClient();

        const generatedPassword = userData.password || generatePassword();

        const newUser = await client
            .api("/users")
            .post({
                accountEnabled: true,
                displayName: userData.displayName,
                givenName: userData.givenName,
                surname: userData.surname,
                mailNickname: userData.mailNickname,
                userPrincipalName: `${userData.mailNickname}@${process.env.TENANT_DOMAIN}`,
                country: userData.country,
                state: userData.state || "",
                department: userData.department || "",
                jobTitle: userData.jobTitle || "",
                passwordProfile: {
                    forceChangePasswordNextSignIn: true,
                    password: generatedPassword,
                },
            });

        return {
            user: newUser,
            temporaryPassword: generatedPassword,
        };
    } catch (error: any) {
        console.error("❌ Erreur createUser:", error);
        throw new Error(error.message || "Impossible de créer l'utilisateur");
    }
}

/**
 * Met à jour un utilisateur
 */
export async function updateUser(userId: string, updates: UpdateUserData) {
    try {
        const client = await getGraphClient();

        // Nettoyer les champs undefined
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, value]) => value !== undefined)
        );

        const updatedUser = await client
            .api(`/users/${userId}`)
            .patch(cleanUpdates);

        return updatedUser;
    } catch (error: any) {
        console.error(`❌ Erreur updateUser (${userId}):`, error);
        throw new Error(error.message || "Impossible de mettre à jour l'utilisateur");
    }
}

/**
 * Supprime un utilisateur
 */
export async function deleteUser(userId: string) {
    try {
        const client = await getGraphClient();

        await client
            .api(`/users/${userId}`)
            .delete();

        return { success: true };
    } catch (error: any) {
        console.error(`❌ Erreur deleteUser (${userId}):`, error);
        throw new Error(error.message || "Impossible de supprimer l'utilisateur");
    }
}

/**
 * Récupère les utilisateurs par pays
 */
export async function getUsersByCountry(country: string) {
    return getUsers(`country eq '${country}'`);
}

/**
 * Recherche des utilisateurs
 */
export async function searchUsers(query: string) {
    return getUsers(undefined, query);
}

/**
 * Vérifie si un utilisateur existe
 */
export async function userExists(userId: string): Promise<boolean> {
    try {
        const client = await getGraphClient();
        await client.api(`/users/${userId}`).select("id").get();
        return true;
    } catch {
        return false;
    }
}

/**
 * Génère un mot de passe temporaire
 */
function generatePassword(): string {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}
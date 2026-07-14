/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/graph/groups.ts
import { getGraphClient } from "./client";

export interface Group {
    id: string;
    displayName: string;
    description?: string;
    visibility?: string;
}

export interface GroupMember {
    id: string;
    displayName: string;
    mail?: string;
    userPrincipalName: string;
}

/**
 * Récupère tous les groupes de sécurité
 */
export async function getGroups(search?: string) {
    try {
        const client = await getGraphClient();

        let query = client
            .api("/groups")
            .select("id,displayName,description,visibility")
            .filter("securityEnabled eq true");

        if (search) {
            query = query.filter(`startswith(displayName, '${search}')`);
        }

        const response = await query.top(100).get();
        return response.value as Group[];
    } catch (error) {
        console.error("❌ Erreur getGroups:", error);
        throw new Error("Impossible de récupérer les groupes");
    }
}

/**
 * Récupère les membres d'un groupe
 */
export async function getGroupMembers(groupId: string) {
    try {
        const client = await getGraphClient();

        const response = await client
            .api(`/groups/${groupId}/members`)
            .select("id,displayName,mail,userPrincipalName")
            .get();

        return response.value as GroupMember[];
    } catch (error) {
        console.error(`❌ Erreur getGroupMembers (${groupId}):`, error);
        throw new Error("Impossible de récupérer les membres du groupe");
    }
}

/**
 * Ajoute un membre à un groupe
 */
export async function addMemberToGroup(groupId: string, userId: string) {
    try {
        const client = await getGraphClient();

        await client
            .api(`/groups/${groupId}/members/$ref`)
            .post({
                "@odata.id": `https://graph.microsoft.com/v1.0/users/${userId}`,
            });

        return { success: true };
    } catch (error: any) {
        console.error(`❌ Erreur addMemberToGroup (${groupId}, ${userId}):`, error);
        throw new Error(error.message || "Impossible d'ajouter le membre au groupe");
    }
}

/**
 * Retire un membre d'un groupe
 */
export async function removeMemberFromGroup(groupId: string, userId: string) {
    try {
        const client = await getGraphClient();

        await client
            .api(`/groups/${groupId}/members/${userId}/$ref`)
            .delete();

        return { success: true };
    } catch (error: any) {
        console.error(`❌ Erreur removeMemberFromGroup (${groupId}, ${userId}):`, error);
        throw new Error(error.message || "Impossible de retirer le membre du groupe");
    }
}

/**
 * Vérifie si un utilisateur est membre d'un groupe
 */
export async function isUserInGroup(groupId: string, userId: string): Promise<boolean> {
    try {
        const client = await getGraphClient();

        const response = await client
            .api(`/groups/${groupId}/members/${userId}`)
            .get();

        return !!response;
    } catch {
        return false;
    }
}

/**
 * Récupère les groupes d'un utilisateur
 */
export async function getUserGroups(userId: string) {
    try {
        const client = await getGraphClient();

        const response = await client
            .api(`/users/${userId}/memberOf`)
            .select("id,displayName,description")
            .filter("securityEnabled eq true")
            .get();

        return response.value as Group[];
    } catch (error) {
        console.error(`❌ Erreur getUserGroups (${userId}):`, error);
        throw new Error("Impossible de récupérer les groupes de l'utilisateur");
    }
}
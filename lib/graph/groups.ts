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
 * Get all security groups
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
        console.error("❌ Error getGroups:", error);
        throw new Error("Unable to fetch groups");
    }
}

/**
 * Get group members
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
        console.error(`❌ Error getGroupMembers (${groupId}):`, error);
        throw new Error("Unable to fetch group members");
    }
}

/**
 * Add a member to a group
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
        console.error(`❌ Error addMemberToGroup (${groupId}, ${userId}):`, error);
        throw new Error(error.message || "Unable to add member to group");
    }
}

/**
 * Remove a member from a group
 */
export async function removeMemberFromGroup(groupId: string, userId: string) {
    try {
        const client = await getGraphClient();

        await client
            .api(`/groups/${groupId}/members/${userId}/$ref`)
            .delete();

        return { success: true };
    } catch (error: any) {
        console.error(`❌ Error removeMemberFromGroup (${groupId}, ${userId}):`, error);
        throw new Error(error.message || "Unable to remove member from group");
    }
}

/**
 * Check if a user is a group member
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
 * Get a user's groups
 */
export async function getUserGroups(userId: string) {
    try {
        const client = await getGraphClient();

        const response = await client
            .api(`/users/${userId}/memberOf`)
            .select("id,displayName,description")
            .get();

        return (response.value as any[]).filter(
            (g) => g["@odata.type"] === "#microsoft.graph.group"
        ) as Group[];
    } catch (error) {
        console.error(`❌ Error getUserGroups (${userId}):`, error);
        throw new Error("Unable to fetch user groups");
    }
}
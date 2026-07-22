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
    password?: string;
    otherMails?: string[];
}

export interface UpdateUserData {
    displayName?: string;
    givenName?: string;
    surname?: string;
    country?: string;
    state?: string;
    accountEnabled?: boolean;
    otherMails?: string[];
}

/**
 * Get all users with optional filters
 */
const TARGET_SKUS = ["O365_BUSINESS_PREMIUM", "O365_BUSINESS_ESSENTIALS"]

export async function getUsers(filter?: string, search?: string, includeLicenses?: boolean) {
    try {
        const client = await getGraphClient();

        let query = client
            .api("/users")
            .select("id,displayName,mail,userPrincipalName,country,state,accountEnabled,otherMails,proxyAddresses");

        if (filter) {
            query = query.filter(filter);
        }

        if (search) {
            query = query.filter(`startswith(displayName, '${search}') or startswith(mail, '${search}')`);
        }

        const response = await query.top(500).get();
        const users = response.value as User[];

        if (includeLicenses) {
            const results = await Promise.allSettled(
                users.map(async (u) => {
                    const details = await client.api(`/users/${u.id}/licenseDetails`).get()
                    const skus: string[] = (details.value as { skuPartNumber: string }[])
                        .filter((l) => TARGET_SKUS.includes(l.skuPartNumber))
                        .map((l) => l.skuPartNumber)
                    return { id: u.id, skus }
                })
            )
            results.forEach((r) => {
                if (r.status === "fulfilled") {
                    const user = users.find((u) => u.id === r.value.id)
                    if (user) user.licenses = r.value.skus
                }
            })
        }

        return users;
    } catch (error) {
        console.error("❌ Error getUsers:", error);
        throw new Error("Unable to fetch users");
    }
}

/**
 * Get a user by ID
 */
export async function getUserById(userId: string) {
    try {
        const client = await getGraphClient();

        const user = await client
            .api(`/users/${userId}`)
            .select("id,displayName,mail,userPrincipalName,country,state,accountEnabled,otherMails,proxyAddresses")
            .get();

        return user as User;
    } catch (error) {
        console.error(`❌ Error getUserById (${userId}):`, error);
        throw new Error("User not found");
    }
}

/**
 * Create a new user
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
                otherMails: userData.otherMails || [],
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
        console.error("❌ Error createUser:", error);
        throw new Error(error.message || "Unable to create user");
    }
}

/**
 * Update a user
 */
export async function updateUser(userId: string, updates: UpdateUserData) {
    try {
        const client = await getGraphClient();

        // Nettoyer les champs undefined
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter((entry): entry is [string, NonNullable<UpdateUserData[keyof UpdateUserData]>] => entry[1] !== undefined)
        );

        const updatedUser = await client
            .api(`/users/${userId}`)
            .patch(cleanUpdates);

        return updatedUser;
    } catch (error: any) {
        console.error(`❌ Error updateUser (${userId}):`, error);
        throw new Error(error.message || "Unable to update user");
    }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string) {
    try {
        const client = await getGraphClient();

        await client
            .api(`/users/${userId}`)
            .delete();

        return { success: true };
    } catch (error: any) {
        console.error(`❌ Error deleteUser (${userId}):`, error);
        throw new Error(error.message || "Unable to delete user");
    }
}

/**
 * Get users by country
 */
export async function getUsersByCountry(country: string) {
    return getUsers(`country eq '${country}'`);
}

/**
 * Search users
 */
export async function searchUsers(query: string) {
    return getUsers(undefined, query);
}

/**
 * Check if a user exists
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
 * Generate a temporary password
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
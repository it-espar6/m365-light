import type { DefaultSession } from 'next-auth';

export interface User {
    userPrincipalName: string;
    firstName: string;
    lastName: string;
    id: string;
    displayName: string;
    mail: string;
    mailNickname: string;
    country: string;
    state: string;
    groups: string[];
    password?: string; // Optionnel, utilisé uniquement lors de la création d'un utilisateur
}

export interface UserSession extends DefaultSession {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string;
        country?: string;
        state?: string;
        groups?: string[];
    };
}
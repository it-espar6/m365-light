// src/app/api/users/route.ts
import { createUser, getUsers } from '@/lib/graph/users';
import { authOptions } from '@/libs/auth';
import { checkScope } from '@/middleware/scope';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country');

    // Appliquer le scope
    const allowedCountries = getScopeForUser(session.user.id);
    if (country && !allowedCountries.includes(country)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await getUsers(session.accessToken, `country eq '${country}'`);
    return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // Vérifier que l'utilisateur a le droit de créer dans ce pays
    if (!checkScope(session.user, body.country)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const newUser = await createUser(session.accessToken, body);
    return NextResponse.json(newUser);
}
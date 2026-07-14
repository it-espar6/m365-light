import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    async function middleware(req) {
        const token = req.nextauth.token;
        // Vérifier que l'utilisateur est dans le bon groupe
        //const isAuthorized = await checkAuthorizedGroup(token, user.id);
        if (!token?.groups?.includes('IAM-Console-Users')) {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);



export const config = {
    matcher: ['/dashboard/:path*', '/api/admin/:path*'],
};
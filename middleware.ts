import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    // Public routes that don't require authentication
    const publicRoutes = [
        '/',
        '/sign-in',
        '/sign-up',
        '/api/sign-in/magic-link',
        '/api/sign-in/magic-link/callback',
        '/api/payment-requests', // GET for tracking
        '/api/auth',
    ];

    // Check if the current path is public
    const isPublicRoute = publicRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    );

    // Allow public routes to proceed
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // For API routes, we'll handle authentication in the route handlers
    if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // For protected routes, check authentication
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session) {
        // Redirect to sign-in page with return URL
        const signInUrl = new URL('/sign-in', request.url);
        signInUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Continue with the request
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
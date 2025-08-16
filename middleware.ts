import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/session';

const protectedRoutes = ['/dashboard', '/tasks'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Validate session if it exists and we're on a protected route
  if (sessionCookie && isProtectedRoute) {
    try {
      const sessionData = await verifyToken(sessionCookie.value);
      
      // Check if session is expired
      if (!sessionData || !sessionData.user || !sessionData.expires) {
        throw new Error('Invalid session data');
      }
      
      if (new Date(sessionData.expires) < new Date()) {
        throw new Error('Session expired');
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      const response = NextResponse.redirect(new URL('/sign-in', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};

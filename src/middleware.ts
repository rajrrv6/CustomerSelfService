import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserRole } from '@/types';
import { AUTH_COOKIES } from '@/lib/auth/authStorage';
import { canRoleAccessPath, getHomeRouteForRole } from '@/lib/auth/roleRouting';

const PUBLIC_PATHS = ['/', '/login', '/login/mfa', '/demo-sandbox', '/access-denied'];

const PROTECTED_PREFIXES = ['/admin', '/tenant', '/workspace', '/portal'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isAuthenticated = request.cookies.get(AUTH_COOKIES.authenticated)?.value === '1';
  const role = request.cookies.get(AUTH_COOKIES.role)?.value as UserRole | undefined;

  if (isProtectedPath(pathname)) {
    if (!isAuthenticated || !role) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!canRoleAccessPath(role, pathname)) {
      const deniedUrl = request.nextUrl.clone();
      deniedUrl.pathname = '/access-denied';
      return NextResponse.redirect(deniedUrl);
    }
  }

  if (isAuthenticated && role && pathname.startsWith('/login')) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = getHomeRouteForRole(role);
    return NextResponse.redirect(homeUrl);
  }

  if (!isPublicPath(pathname) && !isProtectedPath(pathname) && pathname !== '/access-denied') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

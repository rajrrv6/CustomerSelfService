import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserRole } from '@/types';
import { AUTH_COOKIES } from '@/lib/auth/authStorage';
import { canRoleAccessPath, getHomeRouteForRole } from '@/lib/auth/roleRouting';

const PUBLIC_PATHS = [
  '/',
  '/signin',
  '/signin/mfa',
  '/signin/forgot-password',
  '/signin/reset-password',
  '/register',
  '/demo-sandbox',
  '/access-denied',
];

const PUBLIC_PREFIXES = ['/kb', '/bot', '/callback', '/portal/public'];

const PROTECTED_PREFIXES = [
  '/admin',
  '/tenant',
  '/workspace',
  '/portal/home',
  '/portal/tickets',
  '/portal/chat-history',
  '/portal/profile',
  '/portal/private',
  '/tickets',
  '/super-admin',
  '/client-admin',
  '/end-user'
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
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

  // Redirect legacy login endpoints to /signin
  if (
    pathname === '/login' ||
    pathname.startsWith('/login/') ||
    pathname === '/end-user/login' ||
    pathname === '/client-admin/login' ||
    pathname === '/super-admin/login' ||
    pathname === '/operations/login' ||
    pathname === '/operations-login'
  ) {
    const target = pathname.startsWith('/login/')
      ? pathname.replace('/login/', '/signin/')
      : '/signin';
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = target;
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === '/portal') {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/portal/home';
    return NextResponse.redirect(homeUrl);
  }

  const isAuthenticated = request.cookies.get(AUTH_COOKIES.authenticated)?.value === '1';
  const role = request.cookies.get(AUTH_COOKIES.role)?.value as UserRole | undefined;

  if (isProtectedPath(pathname)) {
    if (!isAuthenticated || !role) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/signin';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!canRoleAccessPath(role, pathname)) {
      const deniedUrl = request.nextUrl.clone();
      deniedUrl.pathname = '/access-denied';
      return NextResponse.redirect(deniedUrl);
    }
  }

  if (isAuthenticated && role && pathname.startsWith('/register')) {
    if (pathname === '/register/success' && role === 'customer') {
      return NextResponse.next();
    }

    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = getHomeRouteForRole(role);
    return NextResponse.redirect(homeUrl);
  }

  // Redirect already-authenticated users away from /signin
  if (isAuthenticated && role && pathname.startsWith('/signin')) {
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

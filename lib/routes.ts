export const ROUTES = {
  // Public
  login:        '/login',

  // Protected
  dashboard:    '/dashboard',
  transactions: '/transactions',
  add:          '/add',
  settings:     '/settings',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];

/** Routes that require authentication */
export const PROTECTED_ROUTES: string[] = [
  ROUTES.dashboard,
  ROUTES.transactions,
  ROUTES.add,
  ROUTES.settings,
];

/** Routes only for unauthenticated users */
export const AUTH_ROUTES: string[] = [
  ROUTES.login,
];

export function isProtected(pathname: string): boolean {
  return PROTECTED_ROUTES.some(r => pathname.startsWith(r));
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname);
}

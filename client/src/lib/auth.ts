import type { AuthResult, UserSession } from '../types';

const USER_KEY = 'trip_user';
const AUTH_KEY = 'trip_auth';

export function saveUser(data: UserSession): void {
  localStorage.setItem(USER_KEY, JSON.stringify(data));
}

export function getUser(): UserSession | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as UserSession) : null;
}

export function saveAuth(data: AuthResult): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

export function getAuth(): AuthResult | null {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? (JSON.parse(raw) as AuthResult) : null;
}

export function clearAuth(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(AUTH_KEY);
}

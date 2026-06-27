import type { AuthResult } from '../types';

const KEY = 'trip_auth';

export function saveAuth(data: AuthResult): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getAuth(): AuthResult | null {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as AuthResult) : null;
}

export function clearAuth(): void {
  localStorage.removeItem(KEY);
}

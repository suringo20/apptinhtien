import { getAuth } from './lib/auth';
import type { Trip, Activity, Summary, MyCosts, AuthResult, UserSession } from './types';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const auth = getAuth();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(auth ? { 'x-member-id': String(auth.memberId) } : {}),
  };
  const res = await fetch(`/api${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  register: (body: { name: string; contact: string; password: string }) =>
    apiFetch<{ userId: number }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { contact: string; password: string }) =>
    apiFetch<UserSession>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  joinTrip: (body: { tripCode: string; userId: number; orgCode?: string }) =>
    apiFetch<AuthResult>('/auth/join', { method: 'POST', body: JSON.stringify(body) }),

  getTrip: () => apiFetch<Trip>('/trip'),

  createTrip: (body: {
    name: string;
    currency: string;
    orgCode: string;
    members: { name: string; contact: string }[];
    start_date?: string;
    end_date?: string;
  }) => apiFetch<{ id: number; code: string }>('/trip', { method: 'POST', body: JSON.stringify(body) }),

  getActivities: () => apiFetch<Activity[]>('/activities'),

  createActivity: (body: { name: string; totalAmount: number; memberIds: number[] }) =>
    apiFetch<{ id: number }>('/activities', { method: 'POST', body: JSON.stringify(body) }),

  updateActivity: (id: number, body: { name: string; totalAmount: number; memberIds: number[] }) =>
    apiFetch<{ id: number }>(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  deleteActivity: (id: number) =>
    apiFetch<void>(`/activities/${id}`, { method: 'DELETE' }),

  getSummary: () => apiFetch<Summary>('/summary'),

  getMyCosts: () => apiFetch<MyCosts>('/summary/me'),
};

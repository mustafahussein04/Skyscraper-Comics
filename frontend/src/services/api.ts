import type { Product } from '@/types/product'
import type { AdminEvent } from '@/data/events'
import type { Reservation } from '@/types/reservation'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
  return data as T
}

// ── Products ─────────────────────────────────────────────────────────────────

export const getProducts = (params?: { type?: string; brand?: string; search?: string }) => {
  const qs = new URLSearchParams()
  if (params?.type) qs.set('type', params.type)
  if (params?.brand) qs.set('brand', params.brand)
  if (params?.search) qs.set('search', params.search)
  return request<Product[]>(`/api/products${qs.toString() ? '?' + qs : ''}`)
}

export const getProduct = (id: number) =>
  request<Product>(`/api/products/${id}`)

export const createProduct = (data: Omit<Product, 'id'>) =>
  request<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) })

export const updateProduct = (id: number, data: Omit<Product, 'id'>) =>
  request<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteProduct = (id: number) =>
  request<{ success: boolean }>(`/api/products/${id}`, { method: 'DELETE' })

// ── Events ────────────────────────────────────────────────────────────────────

export const getEvents = () =>
  request<AdminEvent[]>('/api/events')

export const createEvent = (data: Omit<AdminEvent, 'id'>) =>
  request<AdminEvent>('/api/events', { method: 'POST', body: JSON.stringify(data) })

export const updateEvent = (id: number, data: Omit<AdminEvent, 'id'>) =>
  request<AdminEvent>(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteEvent = (id: number) =>
  request<{ success: boolean }>(`/api/events/${id}`, { method: 'DELETE' })

// ── Reservations ──────────────────────────────────────────────────────────────

export const getReservations = (search?: string) => {
  const qs = search ? `?search=${encodeURIComponent(search)}` : ''
  return request<Reservation[]>(`/api/reservations${qs}`)
}

export const createReservation = (data: {
  productId: number
  firstName: string
  lastName: string
  phoneNumber: string
}) =>
  request<{ success: boolean; message?: string; confirmationNumber: string; productName: string; expiresAt: string }>(
    '/api/reservations',
    { method: 'POST', body: JSON.stringify(data) }
  )

// ── Auth ──────────────────────────────────────────────────────────────────────

export const adminLogin = (email: string, password: string) =>
  request<{ success: boolean }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

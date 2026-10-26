import type { Product } from '@/types/product'
import type { AdminEvent } from '@/data/events'
import type { Reservation } from '@/types/reservation'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: init?.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
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

export type ProductFormData = Omit<Product, 'id' | 'image'> & { image?: string; imageFile?: File | null }

const productForm = (data: ProductFormData) => {
  const form = new FormData()
  form.append('name', data.name)
  form.append('price', String(data.price))
  form.append('type', data.type)
  form.append('brand', data.brand)
  form.append('stock', String(data.stock))
  form.append('description', data.description)
  if (data.image) form.append('image', data.image)
  if (data.imageFile) form.append('productImage', data.imageFile)
  return form
}

export const createProduct = (data: ProductFormData) =>
  request<Product>('/api/products', { method: 'POST', body: productForm(data) })

export const updateProduct = (id: number, data: ProductFormData) =>
  request<Product>(`/api/products/${id}`, { method: 'PUT', body: productForm(data) })

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

export const getReservations = (email?: string) => {
  const qs = email ? `?email=${encodeURIComponent(email)}` : ''
  return request<Reservation[]>(`/api/reservations${qs}`)
}

export const createReservation = (productId: number, userEmail: string) =>
  request<{ success: boolean; message: string; stock: number }>('/api/reservations', {
    method: 'POST',
    body: JSON.stringify({ productId, userEmail }),
  })

// ── Auth ──────────────────────────────────────────────────────────────────────

export const adminLogin = (email: string, password: string) =>
  request<{ success: boolean }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

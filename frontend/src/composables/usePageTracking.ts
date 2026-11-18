/**
 * Records page visits and durations to the backend analytics endpoint.
 * Call initPageTracking() once from main.ts after the router is ready.
 * Admin routes (/admin, /login, /signup) are intentionally excluded.
 */

import type { Router } from 'vue-router'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
const ENDPOINT = `${BASE}/api/analytics`

const EXCLUDED = ['/admin', '/login', '/signup']
const isTracked = (path: string) => !EXCLUDED.some(p => path.startsWith(p))

let pageStart = 0
let currentPath = ''

function flush(path: string, startTime: number) {
  if (!path || !isTracked(path)) return
  const duration = Math.round((Date.now() - startTime) / 1000)
  const payload = JSON.stringify({ path, duration })
  // sendBeacon is fire-and-forget and survives page unload
  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' })
    navigator.sendBeacon(ENDPOINT, blob)
  } else {
    fetch(ENDPOINT, { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
  }
}

export function initPageTracking(router: Router) {
  router.afterEach((to) => {
    // Flush the previous page before starting the new one
    if (currentPath) flush(currentPath, pageStart)
    if (isTracked(to.path)) {
      currentPath = to.path
      pageStart = Date.now()
    } else {
      currentPath = ''
    }
  })

  // Flush on tab close / refresh
  window.addEventListener('beforeunload', () => {
    if (currentPath) flush(currentPath, pageStart)
  })
}

export function trackEventLinkClick(eventTitle: string) {
  const payload = JSON.stringify({ type: 'event_click', eventTitle })
  fetch(ENDPOINT, { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' } }).catch(() => {})
}

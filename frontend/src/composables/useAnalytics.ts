// Google Analytics 4 tracking for the customer-facing site.
// The gtag script is only loaded from PublicLayout, so admin portal pages never load it.

import type { Product } from '@/types/product'

type GtagParams =Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
    [key: `ga-disable-${string}`]: boolean | undefined
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

let initialized = false

// Loads gtag.js once. Page views are sent manually from the router so SPA navigation is tracked.
export const initAnalytics = () => {
  if (initialized || !MEASUREMENT_ID) return
  initialized = true

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // gtag.js expects the raw arguments object, not an array
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', MEASUREMENT_ID, {
    send_page_view: false,
    debug_mode: import.meta.env.DEV,
  })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)
}

// Stops hits while an admin page is open, in case gtag was loaded earlier in the session.
export const setAnalyticsEnabled = (enabled: boolean) => {
  if (!MEASUREMENT_ID) return
  window[`ga-disable-${MEASUREMENT_ID}`] = !enabled
}

export const trackEvent = (name: string, params: GtagParams = {}) => {
  if (!MEASUREMENT_ID || !window.gtag) return
  window.gtag('event', name, params)
}

export const productAnalyticsParams = (product: Product): GtagParams => ({
  item_id: product.id,
  item_name: product.name,
  item_category: product.type,
  item_brand: product.brand,
  price: product.price,
})

export const trackPageView =(path: string, title: string) => {
  trackEvent('page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: title,
  })
}

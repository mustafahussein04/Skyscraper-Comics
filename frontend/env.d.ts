/// <reference types="vite/client" />

interface ImportMetaEnv {
  // GA4 Measurement ID (G-XXXXXXXXXX). Public by design; leave unset to disable tracking.
  readonly VITE_GA_MEASUREMENT_ID?: string
}

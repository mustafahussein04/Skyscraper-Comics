/** Empty links are allowed; supplied links must be absolute HTTP(S) URLs. */
export function isValidRegistrationLink(value: unknown): value is string {
  if (typeof value !== 'string') return false
  if (value === '') return true
  if (!/^https?:\/\//i.test(value) || /\s/.test(value)) return false
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname)
  } catch {
    return false
  }
}

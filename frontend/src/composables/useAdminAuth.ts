import { adminLogin } from '@/services/api'

const ADMIN_SESSION_KEY = 'skyscraper-comics-admin-session'

export const isAdminAuthenticated = () => sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'

export const signInAdmin = async (
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await adminLogin(email, password)
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Login failed.' }
  }
}

export const signOutAdmin = () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY)
}

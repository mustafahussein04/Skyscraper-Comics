const ADMIN_SESSION_KEY = 'skyscraper-comics-admin-session'

export const isAdminAuthenticated = () => sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'

export const signInAdmin = () => {
  sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
}

export const signOutAdmin = () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY)
}

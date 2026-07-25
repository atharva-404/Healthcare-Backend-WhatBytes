import { createContext, useContext, useState } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  function persistSession({ access, refresh, user }) {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }

  async function login(credentials) {
    const data = await authApi.login(credentials)
    persistSession(data)
    return data.user
  }

  async function register(details) {
    const data = await authApi.register(details)
    return data.user
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = { user, isAuthenticated: !!user, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

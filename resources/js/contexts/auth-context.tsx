"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import api from "@/services/api" // your axios instance

export interface User {
  user_id: string
  email: string
  first_name: string
  last_name: string,
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        try {
          const { data } = await api.get('/user') // get latest user with tags
          setUser(data)
          localStorage.setItem('user', JSON.stringify(data))
        } catch (err) {
          console.error("Failed to load user", err)
          setUser(null)
          localStorage.removeItem('user')
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data } = await api.post('/login', { email, password })
      // store token + user
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      setUser(data.user)
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setLoading(true)
    try {
      const { data } = await api.post('/register', { email, password, name })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      setUser(data.user)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

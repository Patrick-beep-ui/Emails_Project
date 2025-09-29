"use client"

import { useAuth } from "@/contexts/auth-context"
import Login from "./Login"
import Dashboard from "./Dashboard"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return user ? <Dashboard /> : <Login />
}

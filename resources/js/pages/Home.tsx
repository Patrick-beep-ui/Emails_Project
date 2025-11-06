"use client"

import { useAuth } from "@/contexts/auth-context"
import Login from "./Login"
import Dashboard from "./Dashboard"
import {memo} from "react"
import { TagsProvider } from "@/contexts/tags-context"

function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return user ? (
    <TagsProvider user={user}> 
      <Dashboard />
    </TagsProvider>
  ) : (
    <Login />
  )
}

export default memo(Home);
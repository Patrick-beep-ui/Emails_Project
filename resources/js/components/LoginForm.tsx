"use client"

import type React from "react"

import { useState, useCallback, memo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function LoginFormComponent() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const { login, register } = useAuth()

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")

    try {
      if (isLogin) {
        await login(email, password)
        window.location.href = "/"
      } else {
        await register(email, password, name)
      }
    } catch (error: any) {
      console.error("Authentication error:", error)
      if (error.response) {
        const { status, data } = error.response
  
        if (status === 401) {
          alert("Incorrect email or password.")
        } else if (status === 409 || data.message?.includes("already authenticated")) {
          alert("You are already signed in.")
        } else {
          alert(data.message || "An unexpected error occurred.")
        }
      } else {
        alert("Network error. Please check your connection.")
      }
    } finally {
      setLoading(false)
    }
  }, [isLogin, email, password, name, login, register])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-wide text-primary mb-2">News Emailer</h1>
          <p className="text-muted-foreground text-sm">Personalized news delivery</p>
        </div>

        <Card className="border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-light">{isLogin ? "Sign in" : "Create account"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to access your news feed"
                : "Sign up to start receiving personalized news"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-input border-border/50"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-input border-border/50"
                />
              </div>

              {errorMessage && (
                <p className="text-destructive text-sm text-center">{errorMessage}</p>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {/*isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"*/}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const LoginForm =  memo(LoginFormComponent);
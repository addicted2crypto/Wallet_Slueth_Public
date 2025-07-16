"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Mail, Lock, Shield } from "lucide-react"
import Link from "next/link"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)

  // Check admin mode on component mount
  useEffect(() => {
    const checkAdminMode = async () => {
      try {
        const response = await fetch("/api/admin/check")
        const data = await response.json()
        setIsAdminMode(data.adminMode)
      } catch (error) {
        console.error("Failed to check admin mode:", error)
      }
    }
    checkAdminMode()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate auth process
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = "/dashboard"
    }, 2000)
  }

  const handleAdminLogin = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = "/admin"
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              Welcome to WalletTrace
              {isAdminMode && <span className="text-xs bg-red-600 px-2 py-1 rounded ml-2">ADMIN</span>}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isAdminMode
                ? "Admin access enabled - Choose your login method"
                : "Sign in to start tracking wallet clusters"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAdminMode && (
              <div className="mb-6">
                <Card className="bg-red-900/20 border-red-700">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Shield className="h-8 w-8 text-red-400 mx-auto mb-2" />
                      <h3 className="text-white font-medium mb-2">Admin Test Mode</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Skip authentication and access admin dashboard directly
                      </p>
                      <Button
                        onClick={handleAdminLogin}
                        className="w-full bg-red-600 hover:bg-red-700"
                        disabled={isLoading}
                      >
                        {isLoading ? "Logging in..." : "Enter Admin Dashboard"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                <TabsTrigger value="signin" className="text-white">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-white">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10 bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-10 bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-white">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        className="pl-10 bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

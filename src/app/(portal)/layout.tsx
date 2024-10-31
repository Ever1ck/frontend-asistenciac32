"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"
import Header from "@/components/portal/Header"
import Sidebar from "@/components/portal/Sidebar"
import type { UserProfile } from "@/types"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Manejar la hidratación
  useEffect(() => {
    setMounted(true)
    setIsSidebarOpen(window.innerWidth >= 1024)
  }, [])

  // Manejar el responsive
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Obtener el perfil del usuario
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.accessToken) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          })

          if (!response.ok) {
            throw new Error('Failed to fetch user profile')
          }

          const data = await response.json()
          setUserProfile(data)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (status === 'authenticated') {
      fetchUserProfile()
    }
  }, [session, status])

  if (!mounted) {
    return null
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-destructive">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        theme={theme}
        setTheme={setTheme}
        userProfile={userProfile}
      />
      <div className="flex flex-1 pt-16">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          userProfile={userProfile}
        />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 ease-in-out lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <main className="flex-1 overflow-x-hidden bg-muted/50 p-4 lg:pl-[${isSidebarOpen ? '16rem' : '5rem'}]">
          {children}
        </main>
      </div>
    </div>
  )
}
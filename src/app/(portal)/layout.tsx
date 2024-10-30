"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"
import Header from "@/components/portal/Header"
import Sidebar from "@/components/portal/Sidebar"

interface Persona {
  id: number;
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  email: string;
  rol: string;
  persona: Persona;
  avatar: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user.accessToken) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          })

          if (!response.ok) {
            throw new Error('Failed to fetch user profile')
          }

          const data: UserProfile = await response.json()
          setUserProfile(data)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchUserProfile()
  }, [session])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <Header
        toggleSidebar={toggleSidebar}
        theme={theme}
        setTheme={setTheme}
        userProfile={userProfile}
      />
      <div className="flex flex-1 mt-16 bg-gray-100">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          userProfile={userProfile}
        />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300 ease-in-out"
            onClick={toggleSidebar}
          ></div>
        )}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 transition-all duration-300 ease-in-out ${isSidebarOpen ? "lg:ml-20" : "lg:ml-20"
          }`}>
          {children}
        </main>
      </div>
    </div>
  )
}
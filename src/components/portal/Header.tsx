import { Menu, ChevronDown, Sun, Moon, LogOut, User, Settings } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import Link from "next/link"
import type { UserProfile } from "@/types"

const DEFAULT_AVATAR = "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png"

interface HeaderProps {
  toggleSidebar: () => void;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  userProfile: UserProfile | null;
}

export default function Header({ toggleSidebar, theme, setTheme, userProfile }: HeaderProps) {
  const displayName = userProfile?.persona
    ? `${userProfile.persona.nombres} ${userProfile.persona.apellido_paterno}`
    : 'Usuario'

  const avatarUrl = userProfile?.avatar
    ? `${process.env.NEXT_PUBLIC_BACKEND_IMAGES}/${userProfile.avatar}`
    : DEFAULT_AVATAR

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex h-10 items-center text-xl font-semibold">
          <Image
            src="/logoc32.png"
            alt="Logo Comercio 32"
            width={40}
            height={40}
            className="h-auto w-auto"
            priority
          />
          <span className="ml-2 hidden md:inline">Comercio 32</span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <Image
              src={avatarUrl}
              alt="Avatar del usuario"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="hidden md:inline">{displayName}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <Link href="/portal-usuario/profile" className="w-full">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            <span>{theme === "dark" ? "Tema Claro" : "Tema Oscuro"}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: '/login', redirect: true })}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
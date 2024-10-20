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
}

type HeaderProps = {
  toggleSidebar: () => void
  theme: string | undefined
  setTheme: (theme: string) => void
  userProfile: UserProfile | null
}

export default function Header({ toggleSidebar, theme, setTheme, userProfile }: HeaderProps) {
  const displayName = userProfile?.persona
    ? `${userProfile.persona.nombres} ${userProfile.persona.apellido_paterno}`
    : 'Usuario'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="lg:flex"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="h-10 flex items-center ml-2 text-xl font-semibold">
          <Image
            src='/logoc.png'
            alt="Picture of the author"
            sizes="100vw"
            style={{
              width: 'auto',
              height: '100%',
            }}
            width={500}
            height={300}
          />
          <p className=" mx-2">Comercio 32</p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="Avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="hidden md:inline">{displayName}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <Link href={'/portal/profile'}>
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
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
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login', redirect:true })}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
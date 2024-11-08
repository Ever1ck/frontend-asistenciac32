import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface LoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading: boolean
}

export function LoginButton({ isLoading, ...props }: LoginButtonProps) {
    return (
        <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                </>
            ) : (
                'Iniciar Sesión'
            )}
        </Button>
    )
}
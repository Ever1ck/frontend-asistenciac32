export interface Persona {
    id: number;
    dni: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    fecha_nacimiento: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile {
    id: number;
    email: string;
    rol: Role;
    persona: Persona;
    avatar: string;
    createdAt: string;
    updatedAt: string;
}

export type Role = "Usuario" | "Docente" | "Auxiliar" | "Secretaria" | "Innovacion" | "Subdirector" | "Director" | "Administrador";

export interface MenuItem {
    name: string;
    icon: React.ReactNode;
    path: string;
}

export interface RoleMenuItem {
    label: string;
    items: MenuItem[];
}
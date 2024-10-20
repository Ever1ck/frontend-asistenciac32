export interface Noticia {
    id: number;
    titulo: string;
    portada_url: string;
    contenido: string;
    usuario_id: number;
    tipo_entrada: string;
    fecha: string;
    estado_entrada: boolean;
    created_at: string;
    updated_at: string;
    usuario: {
        rol: string;
    };
}

export interface Evento {
    id: number;
    titulo: string;
    portada_url: string;
    contenido: string;
    usuario_id: number;
    tipo_entrada: string;
    fecha: string;
    estado_entrada: boolean;
    created_at: string;
    updated_at: string;
    usuario: {
        rol: string;
    };
}

export async function getNoticias(): Promise<Noticia[] | null> {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
        console.error('NEXT_PUBLIC_BACKEND_URL is not defined in environment variables');
        return null;
    }

    try {
        const res = await fetch(`${backendUrl}/entradas`, { cache: 'no-store' });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    } catch (error) {
        console.error('Error fetching noticias:', error);
        return null;
    }
}

export async function getEventos(): Promise<Evento[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/entradas/eventos`);
    if (!res.ok) {
        throw new Error('Fallo en buscar eventos');
    }
    return res.json();
}
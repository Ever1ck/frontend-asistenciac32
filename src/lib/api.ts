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

export async function getNoticias(): Promise<Noticia[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/entradas`);
    if (!res.ok) {
        throw new Error('Failed to fetch noticias');
    }
    return res.json();
}
export type Acta = {
    id: string;
    name: string;
    type: 'file' | 'registered';
    file?: File;
    url?: string;
    orientation?: 'portrait' | 'landscape';
    dimensions?: { width: number; height: number };
    tipoActa?: string;
    año?: string;
    grado?: string;
    seccion?: string;
  }
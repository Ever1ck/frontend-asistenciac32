export interface Student {
    id: number;
    Persona: {
        nombres: string;
        apellido_paterno: string;
        apellido_materno: string;
    };
}

export interface Course {
    id: number;
    curso: {
        id: number;
        area: {
            id: number;
            nombrearea: string;
        };
    };
    turno: string;
    dia: string;
    horas: string[];
}

export interface GradoAcademico {
    id: number;
    grado: string;
    seccion: string;
    tutor: {
        Persona: {
            nombres: string;
            apellido_paterno: string;
            apellido_materno: string;
        };
    };
    aula: {
        edificio: number;
        piso: number;
        numeroAula: number;
    };
    Estudiante: Student[];
    Horario: Course[];
}

export type AttendanceStatus = 'P' | 'T' | 'F' | '-';

export interface AttendanceRecord {
    id: number;
    fecha: string;
    curso_id: number;
    gradoAcademico_id: number;
    estudiante_id: number;
    estadoAsistencia: 'Presente' | 'Tardanza' | 'Falta';
    estudiante_nombre: string;
    curso_area: string;
}

export interface ExcelInfo {
    grado: string;
    seccion: string;
    tutor: string;
    aula: string;
    curso: string;
    fecha: string;
}
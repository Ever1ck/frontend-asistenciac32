import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import Link from 'next/link'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const subjects = [
    { name: 'Matematicas', classroom: 'Primero | A', students: 35 },
    { name: 'Matematicas', classroom: 'Primero | B', students: 35 },
    { name: 'Matematicas', classroom: 'Primero | C', students: 35 },
    { name: 'Matematicas', classroom: 'Segundo | A', students: 35 },
    { name: 'Matematicas', classroom: 'Tercero | D', students: 35 },
    { name: 'Matematicas', classroom: 'Cuarto | F', students: 35 },
    { name: 'Ciencia y Tecnologia', classroom: 'Segundo | B', students: 32 },
    { name: 'Literatura', classroom: 'Tercero | C', students: 30 },
    { name: 'Historia', classroom: 'Cuarto | A', students: 33 },
]

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const hours = ['1', '2', '3', '4', 'R', '5', '6', '7']
const timeRanges = [
    '7:30 - 8:10', '8:10 - 8:50', '8:50 - 9:30', '9:30 - 10:10',
    '10:10 - 10:20', '10:20 - 11:00', '11:00 - 11:40', '11:40 - 12:30'
]

const schedule = {
    dayShift: [
        [
            { subject: 'Matematica', classroom: 'Primero | A' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
            { subject: 'RECESO', classroom: '' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
        ],
        [
            { subject: '', classroom: '' },
            { subject: 'Matematica', classroom: 'Segundo | A' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
            { subject: 'RECESO', classroom: '' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
        ],
        [
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
            { subject: 'Matematica', classroom: 'Tercero | D' },
            { subject: '', classroom: '' },
            { subject: 'RECESO', classroom: '' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
        ],
        [
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
            { subject: 'RECESO', classroom: '' },
            { subject: 'Matematica', classroom: 'Cuarto | F' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
        ],
        [
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
            { subject: 'Matematica', classroom: 'Primero | B' },
            { subject: '', classroom: '' },
            { subject: 'RECESO', classroom: '' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
        ],
    ],
    afternoonShift: [
        [
            { subject: '', classroom: '' },
            { subject: 'Matematica', classroom: 'Primero | C' },
            { subject: 'Historia', classroom: 'Cuarto | A' },
            { subject: '', classroom: '' },
            { subject: 'RECESO', classroom: '' },
            { subject: 'Literatura', classroom: 'Tercero | C' },
            { subject: '', classroom: '' },
            { subject: 'Matematica', classroom: 'Segundo | A' },
        ],
        [
            { subject: 'Matematica', classroom: 'Tercero | D' },
            { subject: '', classroom: '' },
            { subject: 'Literatura', classroom: 'Tercero | C' },
            { subject: '', classroom: '' },
            { subject: 'RECESO', classroom: '' },
            { subject: 'Historia', classroom: 'Cuarto | A' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
        ],
        [
            { subject: 'Historia', classroom: 'Cuarto | A' },
            { subject: 'Literatura', classroom: 'Tercero | C' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
            { subject: 'RECESO', classroom: '' },
            { subject: 'Matematica', classroom: 'Primero | C' },
            { subject: '', classroom: '' },
            { subject: 'Arte', classroom: 'Segundo | B' },
        ],
        [
            { subject: 'Literatura', classroom: 'Tercero | C' },
            { subject: 'Historia', classroom: 'Cuarto | A' },
            { subject: 'Matematica', classroom: 'Segundo | A' },
            { subject: '', classroom: '' },
            { subject: 'RECESO', classroom: '' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
        ],
        [
            { subject: 'Arte', classroom: 'Segundo | B' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
            { subject: '', classroom: '' },
            { subject: 'RECESO', classroom: '' },
            { subject: 'Matematica', classroom: 'Tercero | D' },
            { subject: 'Historia', classroom: 'Cuarto | A' },
            { subject: 'Literatura', classroom: 'Tercero | C' },
        ],
    ],
}

export default function Component() {
    const groupedSubjects = subjects.reduce<Record<string, typeof subjects>>((acc, subject) => {
        if (!acc[subject.name]) {
            acc[subject.name] = [];
        }
        acc[subject.name].push(subject);
        return acc;
    }, {});

    const renderSchedule = (shift: 'dayShift' | 'afternoonShift') => (
        <Table className="border-collapse">
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px] text-center border-r">
                        <div>Hora</div>
                        <div className="text-xs font-normal">Horario</div>
                    </TableHead>
                    {days.map((day) => (
                        <TableHead key={day} className="text-center border-r last:border-r-0">{day}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {hours.map((hour, hourIndex) => (
                    <TableRow key={hour}>
                        <TableCell className="font-medium text-center border-r">
                            <div>{hour}</div>
                            <div className="text-xs">{timeRanges[hourIndex]}</div>
                        </TableCell>
                        {hour === 'R' ? (
                            <TableCell colSpan={5} className="text-center bg-red-100 dark:bg-red-900">
                                <span className="text-red-600 dark:text-red-100 font-semibold">RECESO</span>
                            </TableCell>
                        ) : (
                            schedule[shift].map((day, dayIndex) => (
                                <TableCell key={`${shift}-${dayIndex}`} className="text-center border-r last:border-r-0 p-0">
                                    {day[hourIndex].subject ? (
                                        <Button variant="ghost" className="w-full h-full rounded-none hover:bg-primary/10 flex flex-col items-center justify-center">
                                            <span>{day[hourIndex].subject}</span>
                                            <span className="text-xs text-gray-500">{day[hourIndex].classroom}</span>
                                        </Button>
                                    ) : (
                                        <span className="block py-2">&nbsp;</span>
                                    )}
                                </TableCell>
                            ))
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-6 mt-5">
                <div className="w-full lg:w-2/5">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Cursos</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                        {Object.entries(groupedSubjects).map(([subjectName, sections]) => (
                            <Card key={subjectName}>
                                <CardHeader>
                                    <CardTitle>{subjectName}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {sections.map((section, index) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">{section.classroom}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Estudiantes: {section.students}
                                                    </p>
                                                </div>
                                                <Link href={`/portal-docente/curso/asistencia/${index + 1}`}>
                                                    <Button variant="ghost">
                                                        <Calendar className="h-5 w-5 mr-2" /> Asistencia
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="w-full lg:w-3/5">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Horario</h2>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Turno Día</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                {renderSchedule('dayShift')}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Turno Tarde</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                {renderSchedule('afternoonShift')}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}
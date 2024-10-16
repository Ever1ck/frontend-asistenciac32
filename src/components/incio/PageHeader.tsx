import Image from 'next/image'

interface PageHeaderProps {
    title: string
    imageSrc: string
    imageAlt: string
}

export default function PageHeader({ title, imageAlt }: PageHeaderProps) {
    return (
        <div className="relative w-full h-[300px] mb-8 mt-[80px]">
            <Image
                src={'/carousel/3.jpg'}
                alt={imageAlt}
                fill
                style={{ objectFit: "cover" }}
                className="brightness-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white text-center px-4">
                    {title}
                </h1>
            </div>
        </div>
    )
}
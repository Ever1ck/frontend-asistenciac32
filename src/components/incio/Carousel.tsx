'use client'

import { useState, useEffect, useRef, TouchEvent } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Evento {
  id: number;
  titulo: string;
  fecha: string;
  portada_url: string;
}

async function getEventos(): Promise<Evento[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/entradas/eventos`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch eventos');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching eventos:', error);
    return [];
  }
}

const defaultImages = [
  '/carousel/1.jpg',
  '/carousel/2.jpeg',
  '/carousel/3.jpg',
  '/carousel/4.jpg',
  '/carousel/5.jpg',
];

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<string[]>([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    async function loadSlides() {
      const eventos = await getEventos();
      const imagenElegida = '/carousel/3.jpg'; // Reemplaza esto con la ruta de tu imagen elegida
      
      let carouselImages = [imagenElegida, ...defaultImages.slice(1)];

      if (eventos.length > 0) {
        const eventImages = eventos.map(evento => `${process.env.NEXT_PUBLIC_BACKEND_IMAGES}/${evento.portada_url}`);
        carouselImages = [
          imagenElegida,
          ...eventImages,
          ...defaultImages.slice(1 + eventImages.length)
        ].slice(0, 5);
      }

      setSlides(carouselImages);
    }

    loadSlides();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 75) {
      nextSlide();
    }

    if (touchEndX.current - touchStartX.current > 75) {
      prevSlide();
    }
  };

  return (
    <div 
      className="relative w-full h-[calc(100vh-124px)] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={slide}
            alt={`Slide ${index + 1}`}
            layout="fill"
            objectFit="cover"
            priority={index === 0}
          />
        </div>
      ))}
      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 p-2 rounded-full bg-white bg-opacity-50 hover:bg-opacity-75 transition-all duration-300 focus:outline-none"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} className="text-gray-800" />
      </button>
      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 p-2 rounded-full bg-white bg-opacity-50 hover:bg-opacity-75 transition-all duration-300 focus:outline-none"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight size={24} className="text-gray-800" />
      </button>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? 'bg-white' : 'bg-gray-400'
            } focus:outline-none`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
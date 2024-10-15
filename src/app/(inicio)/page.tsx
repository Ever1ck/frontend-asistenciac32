import Navbar from '@/components/incio/Navbar'
import Carousel from '@/components/incio/Carousel'
import SocialButtons from '@/components/incio/SocialButtons'
import NewsSection from '@/components/incio/NewSection'
import EventsSection from '@/components/incio/EventsSection'
import React from 'react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Carousel />
      <main className="flex-grow container mx-auto px-4 py-8 relative">
        <SocialButtons />
        <div className="flex flex-col md:flex-row gap-8">
          <NewsSection />
          <EventsSection />
        </div>
      </main>
    </div>
  )
}
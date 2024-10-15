import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function SocialButtons() {
  return (
    <div className="fixed md:left-4 md:top-1/2 md:transform md:-translate-y-1/2 md:space-y-4 md:flex md:flex-col z-20
                    bottom-4 left-4 flex flex-col space-x-0 md:space-x-0">
      <Button variant="outline" size="icon" className="bg-white shadow-md">
        <Facebook className="h-4 w-4 text-blue-600" />
      </Button>
      <Button variant="outline" size="icon" className="bg-white shadow-md">
        <Twitter className="h-4 w-4 text-blue-400" />
      </Button>
      <Button variant="outline" size="icon" className="bg-white shadow-md">
        <Instagram className="h-4 w-4 text-pink-600" />
      </Button>
      <Button variant="outline" size="icon" className="bg-white shadow-md">
        <Youtube className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  )
}
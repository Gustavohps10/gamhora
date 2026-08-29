import * as React from 'react'

import { Features } from '@/app/components/features'
import { Footer } from '@/app/components/footer'
import { Hero } from '@/app/components/hero'
import { Integrations } from '@/app/components/integrations'
import { Navbar } from '@/app/components/navbar'
import { OfflineArchitecture } from '@/app/components/offline-architecture'
import { Pricing } from '@/app/components/pricing'
import { VideoShowcase } from '@/app/components/video-showcase'

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground selection:bg-primary/30 flex min-h-screen flex-col antialiased">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Integrations />
        <OfflineArchitecture />
        <VideoShowcase />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}

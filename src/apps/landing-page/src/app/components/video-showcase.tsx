'use client'

import { Play } from 'lucide-react'
import * as React from 'react'

export function VideoShowcase() {
  return (
    <section id="demo" className="bg-muted/10 relative overflow-hidden py-24">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="text-primary inline-block text-xs font-semibold tracking-widest uppercase">
            Demonstração
          </span>
          <h2 className="text-foreground mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Veja como funciona na prática.
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            Do primeiro timer até o sync com Jira e métricas de foco — em menos
            de 2 minutos.
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Ambient outer glow */}
          <div className="bg-primary/15 absolute inset-x-12 -inset-y-4 -z-10 rounded-full blur-3xl" />

          <div
            className="border-border/60 bg-card/90 group hover:border-primary/50 relative aspect-video cursor-pointer overflow-hidden rounded-lg border shadow-2xl transition-all duration-300"
            style={{
              boxShadow:
                '0 30px 60px -15px rgba(0,0,0,0.3), 0 0 30px -5px hsl(var(--primary)/0.1)',
            }}
          >
            {/* Window header mockup */}
            <div className="border-border/40 bg-muted/40 absolute inset-x-0 top-0 z-10 flex h-10 items-center justify-between border-b px-4 backdrop-blur-md">
              <div className="flex gap-2">
                <div className="size-2.5 rounded-full bg-red-500/60" />
                <div className="size-2.5 rounded-full bg-yellow-500/60" />
                <div className="size-2.5 rounded-full bg-emerald-500/60" />
              </div>
              <div className="text-muted-foreground/60 font-mono text-xs">
                Pandhora Quick Demo
              </div>
              <div className="w-8" />
            </div>

            {/* Play Trigger Overlay */}
            <div className="bg-background/60 group-hover:bg-background/40 absolute inset-0 flex flex-col items-center justify-center backdrop-blur-[2px] transition-all duration-300">
              <div className="relative mb-4">
                <div className="bg-primary text-primary-foreground shadow-primary/30 relative flex size-16 items-center justify-center rounded-lg shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <Play className="ml-0.5 size-7 fill-current" />
                </div>
              </div>
              <p className="text-foreground text-base font-bold">
                Assistir demonstração rápida
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                2 minutos &middot; sem necessidade de cadastro
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

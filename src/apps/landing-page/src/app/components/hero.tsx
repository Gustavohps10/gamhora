'use client'

import { Badge, Button } from '@pandhora/ui/components'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  HardDrive,
  Play,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

import { DownloadCTA } from './download-cta'

export interface HeroStat {
  value: string
  label: string
  detail?: string
}

const STATS: HeroStat[] = [
  {
    value: '10k+',
    label: 'Horas rastreadas',
    detail: 'com precisão ao minuto',
  },
  {
    value: '6+',
    label: 'DataSources integradas',
    detail: 'Jira, Redmine, GitHub...',
  },
  { value: '0ms', label: 'Latência de input', detail: '100% local-first' },
]

export function Hero() {
  return (
    <section
      id="hero"
      className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-32"
    >
      {/* Subtle Background Effects & Glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Glowing Orbs */}
        <div
          className="absolute -top-40 left-1/2 h-[650px] w-[650px] -translate-x-1/2 rounded-full opacity-25 blur-[140px] dark:opacity-20"
          style={{ background: 'var(--primary)' }}
        />
        <div
          className="absolute top-1/3 -left-32 h-[450px] w-[450px] rounded-full opacity-15 blur-[120px] dark:opacity-10"
          style={{ background: 'oklch(0.7 0.15 220)' }}
        />
        <div
          className="absolute right-0 bottom-10 h-[500px] w-[500px] rounded-full opacity-15 blur-[130px] dark:opacity-10"
          style={{ background: 'var(--primary)' }}
        />

        {/* Dot Pattern */}
        <div className="lp-dot-pattern absolute inset-0 opacity-[0.12] dark:opacity-[0.18]" />

        {/* Radial Fade mask */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 35%, transparent 20%, var(--background) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center lg:px-8">
        {/* Eyebrow Badge */}
        <div className="border-primary/20 bg-primary/5 text-primary hover:border-primary/40 hover:bg-primary/10 mb-8 inline-flex items-center gap-2 rounded-lg border px-4 py-1.5 text-xs font-medium backdrop-blur-md transition-all">
          <Sparkles className="size-3.5" />
          <span className="font-semibold tracking-wide">Pandhora Toolkit</span>
          <span className="text-muted-foreground/60">&middot;</span>
          <span className="text-foreground/90 font-normal">
            Observabilidade &amp; Controle de Tarefas e Horas
          </span>
          <ArrowRight className="size-3 opacity-70" />
        </div>

        {/* Main Headline */}
        <h1 className="text-foreground mx-auto max-w-4xl text-5xl leading-[1.08] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          O workflow toolkit com{' '}
          <span className="from-primary via-primary/80 to-primary/60 bg-gradient-to-r bg-clip-text text-transparent">
            observabilidade total
          </span>{' '}
          sobre suas tarefas e tempo.
        </h1>

        {/* Subtext / Value Prop */}
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg lg:text-xl">
          Assuma o controle do seu trabalho técnico. Acompanhe tarefas em tempo
          real, registre horas sem atrito, mapeie sessões de deep work e
          sincronize com Jira, Redmine e GitHub de forma local-first.
        </p>

        {/* Actions / CTA Row */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <DownloadCTA />

          <Button
            asChild
            variant="ghost"
            className="text-muted-foreground hover:text-foreground border-border/50 hover:border-border h-11 gap-2 border px-6 text-sm backdrop-blur-sm"
          >
            <Link href="/#demo">
              <Play className="size-3.5 fill-current" />
              Ver Demo (2 min)
            </Link>
          </Button>
        </div>

        {/* Technical Highlights / Trust Badges */}
        <div className="text-muted-foreground/80 mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5">
            <HardDrive className="size-3.5 text-emerald-500" />
            100% Local-First
          </span>
          <span className="text-muted-foreground/30 hidden sm:inline">
            &middot;
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="text-primary size-3.5" />
            Apontamento sem fricção
          </span>
          <span className="text-muted-foreground/30 hidden sm:inline">
            &middot;
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-sky-500" />
            Privacidade total (Zero Telemetria)
          </span>
          <span className="text-muted-foreground/30 hidden sm:inline">
            &middot;
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            Código Aberto (Open Core)
          </span>
        </div>

        {/* Stats Row */}
        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="border-border/40 bg-card/40 hover:border-border/80 rounded-lg border p-4 backdrop-blur-sm transition-all"
            >
              <div className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
                {stat.value}
              </div>
              <div className="text-foreground/90 mt-1 text-xs font-semibold">
                {stat.label}
              </div>
              {stat.detail && (
                <div className="text-muted-foreground mt-0.5 text-[11px]">
                  {stat.detail}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Premium Product Mockup / Observability UI Showcase */}
        <div className="relative mx-auto mt-16 w-full max-w-5xl">
          {/* Ambient Glow */}
          <div className="bg-primary/20 absolute inset-x-12 top-10 bottom-0 -z-10 rounded-full blur-[100px]" />

          {/* Floating Live Observability Badge */}
          <div className="border-border/60 bg-background/90 absolute -top-4 left-6 z-20 hidden items-center gap-3 rounded-lg border p-2.5 shadow-xl backdrop-blur-md sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
              <Activity className="size-4 animate-pulse" />
            </div>
            <div className="text-left text-xs">
              <div className="text-foreground flex items-center gap-2 font-semibold">
                Deep Work Ativo
                <Badge
                  variant="secondary"
                  className="rounded-md border-0 bg-emerald-500/10 px-1.5 py-0 font-mono text-[9px] text-emerald-500 uppercase"
                >
                  98% Foco
                </Badge>
              </div>
              <div className="text-muted-foreground text-[11px]">
                Sincronizando tarefas com Jira e Redmine
              </div>
            </div>
          </div>

          {/* Screenshot Container */}
          <div className="group border-border/60 bg-card/80 overflow-hidden rounded-lg border shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-white/10 dark:shadow-[0_25px_70px_rgba(0,0,0,0.5)]">
            <div className="border-border/40 bg-muted/40 flex h-9 items-center justify-between border-b px-4">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-red-500/60" />
                <div className="size-2.5 rounded-full bg-yellow-500/60" />
                <div className="size-2.5 rounded-full bg-emerald-500/60" />
              </div>
              <div className="text-muted-foreground/60 font-mono text-[11px]">
                pandhora &mdash; engineering workflow &amp; time observability
              </div>
              <div className="w-8" />
            </div>

            <div className="relative">
              <Image
                src="/images/feature_apontamento2.jpeg"
                alt="Pandhora Workflow & Time Observability Dashboard"
                width={1920}
                height={960}
                className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

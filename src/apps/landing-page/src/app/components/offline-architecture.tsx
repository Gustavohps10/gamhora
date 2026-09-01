'use client'

import {
  ChevronRight,
  Clock,
  CloudOff,
  Database,
  HardDrive,
  Lock,
  RefreshCw,
  Server,
  Terminal,
  Wifi,
  WifiOff,
} from 'lucide-react'
import * as React from 'react'

export interface ArchitectureStep {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}

const OFFLINE_STEPS: ArchitectureStep[] = [
  {
    icon: <HardDrive className="size-6 text-emerald-400" />,
    title: 'Dados armazenados localmente',
    description:
      'Todo o estado reside no seu disco. SQLite embarcado, sem dependência de rede para operar.',
    color: 'border-emerald-500/30 bg-emerald-500/5',
  },
  {
    icon: <CloudOff className="size-6 text-amber-400" />,
    title: 'Funciona 100% offline',
    description:
      'Sem internet? Sem problema. O timer roda, os dados são gravados e o contexto de trabalho é preservado.',
    color: 'border-amber-500/30 bg-amber-500/5',
  },
  {
    icon: <RefreshCw className="size-6 text-sky-400" />,
    title: 'Sync inteligente quando conectado',
    description:
      'Quando a conexão restabelece, o engine de sincronização resolve alterações e atualiza os trackers remotos.',
    color: 'border-sky-500/30 bg-sky-500/5',
  },
  {
    icon: <Lock className="size-6 text-violet-400" />,
    title: 'Soberania e Privacidade',
    description:
      'Nenhum dado seu transita por servidores proprietários de telemetria. Exportação total a qualquer momento.',
    color: 'border-violet-500/30 bg-violet-500/5',
  },
]

export function OfflineArchitecture() {
  return (
    <section id="offline" className="relative overflow-hidden py-24 lg:py-32">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[140px]" />
      </div>

      <div className="container mx-auto px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <HardDrive className="size-3.5" />
            Arquitetura Local-First
          </div>
          <h2 className="text-foreground mx-auto max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Sua produtividade não depende de servidores externos.
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
            Enquanto soluções SaaS ficam fora do ar ou lentas, o Mr-tick
            continua instantâneo. Offline é a regra, não o fallback.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {OFFLINE_STEPS.map((step, index) => (
              <div
                key={step.title}
                className={`relative rounded-lg border p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${step.color}`}
              >
                <div className="mb-4">{step.icon}</div>
                <div className="text-muted-foreground/30 absolute top-5 right-5 font-mono text-xs font-bold">
                  0{index + 1}
                </div>
                <h4 className="text-foreground mb-2 text-sm leading-snug font-bold">
                  {step.title}
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Architecture Data Flow Box */}
          <div className="border-border/50 bg-card/60 mt-10 overflow-hidden rounded-lg border p-6 shadow-sm backdrop-blur-sm">
            <div className="text-muted-foreground/60 mb-5 flex items-center gap-2 font-mono text-xs font-semibold">
              <Terminal className="text-primary size-3.5" />
              data flow architecture &middot; local-first pipeline
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {[
                {
                  label: 'Desktop App',
                  icon: <Clock className="size-4" />,
                  color: 'text-primary border-primary/30 bg-primary/5',
                },
                {
                  label: 'SQLite Local',
                  icon: <Database className="size-4" />,
                  color:
                    'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
                },
                {
                  label: 'Sync Engine',
                  icon: <RefreshCw className="size-4" />,
                  color: 'text-sky-400 border-sky-500/30 bg-sky-500/5',
                },
                {
                  label: 'Jira / Redmine / GitHub',
                  icon: <Server className="size-4" />,
                  color: 'text-violet-400 border-violet-500/30 bg-violet-500/5',
                },
              ].map((node, i, arr) => (
                <React.Fragment key={node.label}>
                  <div
                    className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-xs font-semibold ${node.color}`}
                  >
                    {node.icon}
                    {node.label}
                  </div>
                  {i < arr.length - 1 && (
                    <div className="text-muted-foreground/30 hidden items-center gap-1 sm:flex">
                      <div className="bg-muted-foreground/20 h-px w-6" />
                      <ChevronRight className="size-3.5" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="border-border/40 mt-6 flex flex-wrap gap-5 border-t pt-4">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <WifiOff className="size-3.5 text-amber-400" />
                <span>Offline: persistência imediata em disco</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Wifi className="size-3.5 text-emerald-400" />
                <span>Online: sincronização sem conflito</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Lock className="size-3.5 text-violet-400" />
                <span>Zero telemetria ou armazenamento cloud de terceiros</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

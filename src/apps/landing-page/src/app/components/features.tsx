'use client'

import { Badge } from '@pandhora/ui/components'
import { Activity, CheckCircle, Layers, Sparkles, Timer } from 'lucide-react'
import * as React from 'react'

export interface FeatureItem {
  icon: React.ReactNode
  tag: string
  problem: string
  title: string
  description: string
  highlights: string[]
  accentColor: string
}

const FEATURES: FeatureItem[] = [
  {
    icon: <Activity className="size-5" />,
    tag: 'Observabilidade',
    problem: 'Você não sabe para onde foi seu tempo técnico no final do dia',
    title: 'Métricas de Deep Work e foco com granularidade de minutos',
    description:
      'Detecte trocas de contexto, meça blocos de concentração contínua e visualize a distribuição real do seu esforço entre código, bugs e reuniões.',
    highlights: [
      'Score diário de Deep Work',
      'Detecção de context switching',
      'Cálculo 100% local sem expor dados',
    ],
    accentColor: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10',
  },
  {
    icon: <Layers className="size-5" />,
    tag: 'Controle de Tarefas',
    problem: 'Tarefas espalhadas em múltiplos silos e abas de navegadores',
    title: 'Hub unificado para tarefas de múltiplos DataSources',
    description:
      'Acesse e gerencie seus tickets do Jira, Redmine, GitHub e YouTrack em um único lugar. Crie, atualize status e vincule apontamentos com atalhos de teclado.',
    highlights: [
      'Busca global instantânea (Cmd/Ctrl + K)',
      'Vínculo de PRs e commits às tarefas',
      'Atualização de status bidirecional',
    ],
    accentColor: 'border-sky-500/30 text-sky-500 bg-sky-500/10',
  },
  {
    icon: <Timer className="size-5" />,
    tag: 'Apontamento Inteligente',
    problem: 'Apontar horas manualmente é burocrático e fácil de esquecer',
    title: 'Apontamento de horas rápido que não quebra o fluxo',
    description:
      'Inicie e pause timers globais com um atalho. Salve contexto, adicione notas técnicas e faça push dos logs de horas para os rastreadores automaticamente.',
    highlights: [
      'Atalho global para iniciar timer',
      'Suporte a múltiplos timers simultâneos',
      'Sincronização em segundo plano',
    ],
    accentColor: 'border-violet-500/30 text-violet-500 bg-violet-500/10',
  },
]

export function Features() {
  return (
    <section
      id="features"
      className="bg-muted/15 relative overflow-hidden py-24 lg:py-32"
    >
      <div className="relative z-10 container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="border-primary/20 bg-primary/5 text-primary mb-3 inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1 text-xs font-semibold">
            <Sparkles className="size-3.5" />
            Engenharia &amp; Produtividade
          </div>

          <h2 className="text-foreground mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Construído para a realidade de quem desenvolve software.
          </h2>

          <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
            Não é apenas um timer genérico. É um toolkit completo de
            observabilidade para controlar tarefas, gerenciar horas e maximizar
            seu foco técnico.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="border-border/50 bg-card/70 hover:border-border/90 group relative flex flex-col justify-between rounded-lg border p-7 shadow-xs backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                {/* Problem Callout */}
                <div className="bg-muted/40 mb-4 rounded-md p-3">
                  <p className="text-muted-foreground/80 font-mono text-xs italic">
                    &ldquo;{feature.problem}&rdquo;
                  </p>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg border ${feature.accentColor}`}
                  >
                    {feature.icon}
                  </div>
                  <Badge
                    variant="secondary"
                    className="rounded-md text-[10px] font-semibold tracking-wide"
                  >
                    {feature.tag}
                  </Badge>
                </div>

                <h3 className="text-foreground text-lg leading-snug font-bold">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="border-border/40 mt-6 border-t pt-5">
                <ul className="space-y-2">
                  {feature.highlights.map((h) => (
                    <li
                      key={h}
                      className="text-foreground/80 flex items-center gap-2 text-xs"
                    >
                      <CheckCircle className="size-3.5 shrink-0 text-emerald-500" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

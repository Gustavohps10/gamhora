'use client'

import { ArrowRight, Github, MessageSquarePlus, Terminal } from 'lucide-react'
import Image from 'next/image'
import * as React from 'react'

export interface IntegrationItem {
  name: string
  desc: string
  status: 'live' | 'soon'
  accentBg: string
  accentBorder: string
  darkInvert?: boolean
  logoUrl: string
}

const INTEGRATIONS: IntegrationItem[] = [
  {
    name: 'Jira',
    desc: 'Crie tickets, atualize status e registre horas diretamente nos issues sem abrir nenhuma aba extra.',
    status: 'live',
    accentBg: 'bg-[#0052CC]/10',
    accentBorder: 'border-[#0052CC]/25',
    darkInvert: false,
    logoUrl:
      'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/jira.svg',
  },
  {
    name: 'Redmine',
    desc: 'Sincroniza time entries, atividades personalizadas e percentuais de avanço via REST API oficial.',
    status: 'live',
    accentBg: 'bg-red-600/10',
    accentBorder: 'border-red-600/25',
    darkInvert: false,
    logoUrl:
      'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/redmine.svg',
  },
  {
    name: 'GitHub',
    desc: 'Vincule commits e pull requests com suas sessões de trabalho para rastrear tempo por issue.',
    status: 'live',
    accentBg: 'bg-muted/40',
    accentBorder: 'border-border/60',
    darkInvert: true,
    logoUrl:
      'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/github.svg',
  },
  {
    name: 'YouTrack',
    desc: 'Gerencie work items, sprints e time tracking nativo compatível com instâncias Cloud e On-premise.',
    status: 'live',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/25',
    darkInvert: false,
    logoUrl:
      'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/jetbrains-youtrack.svg',
  },
  {
    name: 'Linear',
    desc: 'Sincronização de cycles, issues e estados com resolução automática de workflows.',
    status: 'soon',
    accentBg: 'bg-violet-500/10',
    accentBorder: 'border-violet-500/25',
    darkInvert: true,
    logoUrl:
      'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/linear.svg',
  },
  {
    name: 'GitLab',
    desc: 'Rastreie Merge Requests, pipelines e logs de tempo nativos com a API v4 do GitLab.',
    status: 'soon',
    accentBg: 'bg-orange-500/10',
    accentBorder: 'border-orange-500/25',
    darkInvert: false,
    logoUrl:
      'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/gitlab.svg',
  },
]

const TECH_STACK = [
  {
    name: 'TypeScript',
    url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/typescript.svg',
  },
  {
    name: 'Node.js',
    url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/nodejs-alt.svg',
  },
  {
    name: 'React',
    url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/reactjs.svg',
  },
  {
    name: 'Next.js',
    url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/nextjs-light.svg',
    invert: false,
  },
  {
    name: 'Tailwind',
    url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/tailwind.svg',
  },
  {
    name: 'Electron',
    url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/electron.svg',
  },
  {
    name: 'Turbopack',
    url: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/turbopack-light.svg',
  },
]

export function Integrations() {
  return (
    <section id="integrations" className="pb-20">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase">
            Ecossistema conectado
          </p>
          <h2 className="mx-auto max-w-xl text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
            Sincroniza com as ferramentas que seu time já usa.
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-relaxed">
            Apontamentos fluem nos dois sentidos — sem copiar e colar, sem
            duplicação, sem atrito.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INTEGRATIONS.map((app) => (
            <div
              key={app.name}
              className="group border-border/40 bg-background hover:border-border relative rounded-lg border p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
            >
              {/* Top */}
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-lg border ${app.accentBg} ${app.accentBorder} overflow-hidden`}
                >
                  <Image
                    src={app.logoUrl}
                    alt={`${app.name} logo`}
                    width={22}
                    height={22}
                    className={`object-contain ${app.darkInvert ? 'dark:invert' : ''}`}
                  />
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-medium ${
                    app.status === 'live'
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                      : 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      app.status === 'live' ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                  />
                  {app.status === 'live' ? 'Disponível' : 'Em breve'}
                </span>
              </div>

              {/* Nome */}
              <div className="mt-5">
                <h3 className="text-base font-semibold tracking-tight">
                  {app.name}
                </h3>
              </div>

              {/* Descrição */}
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {app.desc}
              </p>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between">
                <span className="text-muted-foreground/50 text-[11px] font-medium tracking-wider uppercase">
                  {app.status === 'live'
                    ? 'Sync bidirecional'
                    : 'Em desenvolvimento'}
                </span>

                <div className="text-muted-foreground/40 group-hover:text-muted-foreground flex items-center gap-1 transition-all">
                  <span className="text-xs">Ver detalhes</span>
                  <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Card original: Built by developers, for developers */}
        <div className="relative mt-8 overflow-hidden rounded-lg border border-dashed border-zinc-700 bg-[#0a0a0a] p-8 md:p-12">
          {/* Background Decorativo */}
          <div className="pointer-events-none absolute top-1/2 -right-6 -translate-y-1/2 text-zinc-500 opacity-10 select-none">
            <Terminal size={240} strokeWidth={1} />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <h3 className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">
              Built by developers, for developers.
            </h3>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
              O Pandhora é open-source e focado em privacidade. Sinta-se em casa
              para contribuir com código ou sugerir as ferramentas que faltam no
              seu workflow.
            </p>

            <div className="relative z-10 flex flex-col items-center">
              <div className="mt-10 flex flex-col items-center gap-8">
                {/* Stack Badges - Minimalistas */}
                <div className="flex flex-wrap items-center justify-center gap-6 opacity-40 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
                  {TECH_STACK.map((tech) => (
                    <div
                      key={tech.name}
                      className="group relative flex items-center justify-center"
                    >
                      <Image
                        src={tech.url}
                        alt={tech.name}
                        width={20}
                        height={20}
                        className={`h-5 w-auto transition-transform duration-300 group-hover:scale-110 ${tech.invert ? 'dark:invert' : ''}`}
                      />
                      {/* Tooltip opcional (Estilo Linear) */}
                      <span className="absolute -top-8 scale-0 rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-200 transition-all group-hover:scale-100">
                        {tech.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Divisória sutil */}
                <div className="h-px w-12 bg-zinc-800" />

                {/* Seção de Botões */}
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <a
                    href="https://github.com/gustavohps10/pandhora"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-6 text-sm font-medium text-zinc-950 transition-all hover:bg-zinc-200 active:scale-95"
                  >
                    <Github className="size-4 transition-transform group-hover:rotate-12" />
                    Contribuir no GitHub
                  </a>

                  <a
                    href="https://github.com/gustavohps10/pandhora/issues/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-6 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-100 active:scale-95"
                  >
                    <MessageSquarePlus className="size-4" />
                    Sugerir Integração
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

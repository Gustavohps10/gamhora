'use client'

import {
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@mr-tick/ui/components'
import {
  Building2,
  Check,
  CloudOff,
  Lock,
  RefreshCw,
  ShieldCheck,
  User,
  X,
} from 'lucide-react'
import * as React from 'react'

export interface PricingFeature {
  text: string
  status: 'check' | 'block'
}

export interface PricingPlan {
  name: string
  price: string
  period?: string
  description: string
  features: PricingFeature[]
  highlighted?: boolean
  badge?: string
  cta: string
}

const INDIVIDUAL_PLANS: PricingPlan[] = [
  {
    name: 'Free (Open Core)',
    price: 'R$ 0',
    description:
      'Essencial para o desenvolvedor organizar sua rotina local e apontamentos.',
    features: [
      { text: 'App Desktop nativo (Windows, Mac, Linux)', status: 'check' },
      { text: 'Persistência 100% local (SQLite embarcado)', status: 'check' },
      { text: 'Atalhos globais e Timer rápido', status: 'check' },
      { text: 'Analytics básico de horas por dia', status: 'check' },
      { text: '1 Workspace e 1 DataSource integrada', status: 'check' },
      { text: 'Analytics avançado de Deep Work', status: 'block' },
      { text: 'Gestão de times e squads', status: 'block' },
    ],
    cta: 'Baixar Gratuitamente',
  },
  {
    name: 'Individual Pro',
    price: 'R$ 16,90',
    period: '/mês',
    description:
      'Para o desenvolvedor que busca máxima produtividade e métricas de foco.',
    features: [
      { text: 'Workspaces e DataSources ilimitados', status: 'check' },
      {
        text: 'Múltiplas integrações (Jira, Redmine, GitHub, YouTrack)',
        status: 'check',
      },
      { text: 'Analytics avançado de Deep Work & foco', status: 'check' },
      {
        text: 'Detecção de trocas de contexto (Context switching)',
        status: 'check',
      },
      {
        text: 'Relatórios de esforço exportáveis (JSON, CSV)',
        status: 'check',
      },
      { text: 'Correlação com commits e pull requests', status: 'check' },
      { text: 'Gestão coletiva de times', status: 'block' },
    ],
    highlighted: true,
    badge: 'Mais Popular',
    cta: 'Testar 14 Dias Grátis',
  },
]

const ENTERPRISE_PLANS: PricingPlan[] = [
  {
    name: 'Team Squads',
    price: 'R$ 49',
    period: '/mês por membro',
    description:
      'Visibilidade, alocação e observabilidade de esforço para times técnicos.',
    features: [
      { text: 'Workspaces e DataSources ilimitados', status: 'check' },
      { text: 'Replicação e sync automático de tarefas', status: 'check' },
      { text: 'Dashboard coletivo de horas e alocação', status: 'check' },
      { text: 'Relatórios de esforço por sprint e épico', status: 'check' },
      { text: 'Métricas agregadas de Deep Work da equipe', status: 'check' },
      { text: 'Painel administrativo de membros', status: 'check' },
      { text: 'Modo Self-Hosted dedicado', status: 'block' },
    ],
    highlighted: true,
    badge: 'Para Times',
    cta: 'Iniciar Teste de Equipe',
  },
  {
    name: 'Enterprise Soberano',
    price: 'Sob Consulta',
    description:
      'Soberania total de dados, governança e conformidade corporativa.',
    features: [
      { text: 'Deploy 100% Self-Hosted (On-Premise / VPC)', status: 'check' },
      { text: 'API Pública e Webhooks para ERP/BI', status: 'check' },
      { text: 'Autenticação SSO / SAML / OIDC', status: 'check' },
      {
        text: 'Relatórios customizados de rentabilidade & ROI',
        status: 'check',
      },
      {
        text: 'Controle de políticas de domínio e permissões',
        status: 'check',
      },
      { text: 'SLA de 99.9% e canal de suporte dedicado', status: 'check' },
      { text: 'Treinamento e onboarding guiado', status: 'check' },
    ],
    cta: 'Falar com Especialistas',
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-primary/5 absolute bottom-0 left-1/2 h-[450px] w-[750px] -translate-x-1/2 rounded-full blur-[140px]" />
      </div>

      <div className="container mx-auto px-6 lg:px-8">
        <div className="mb-14 text-center">
          <span className="text-primary inline-block text-xs font-semibold tracking-widest uppercase">
            Planos Transparentes
          </span>
          <h2 className="text-foreground mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Comece grátis. Evolua com seu time.
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-base leading-relaxed sm:text-lg">
            Modelo open-core sustentável. O aplicativo core é gratuito e
            privado; planos Pro e Team adicionam métricas avançadas e
            governança.
          </p>
        </div>

        <Tabs defaultValue="individual" className="mx-auto max-w-4xl">
          <div className="mb-10 flex justify-center">
            <TabsList className="h-10 gap-1 rounded-lg p-1 shadow-xs">
              <TabsTrigger
                value="individual"
                className="gap-2 rounded-md px-5 text-xs font-semibold"
              >
                <User className="size-3.5" />
                <span>Individual</span>
              </TabsTrigger>
              <TabsTrigger
                value="enterprise"
                className="gap-2 rounded-md px-5 text-xs font-semibold"
              >
                <Building2 className="size-3.5" />
                <span>Enterprise</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="individual" className="grid gap-6 md:grid-cols-2">
            {INDIVIDUAL_PLANS.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </TabsContent>

          <TabsContent value="enterprise" className="grid gap-6 md:grid-cols-2">
            {ENTERPRISE_PLANS.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </TabsContent>
        </Tabs>

        {/* Trust Signals */}
        <div className="text-muted-foreground/70 mt-14 flex flex-wrap justify-center gap-8 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>Dados 100% locais por padrão</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CloudOff className="size-4 text-amber-500" />
            <span>Funciona offline sem bloqueios</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="size-4 text-sky-500" />
            <span>Sem cartão de crédito para iniciar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="size-4 text-violet-500" />
            <span>Cancelamento a qualquer momento</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <div
      className={`relative flex flex-col justify-between rounded-lg border p-7 transition-all duration-300 hover:-translate-y-1 ${
        plan.highlighted
          ? 'border-primary/60 bg-primary/5 shadow-primary/10 ring-primary/30 shadow-xl ring-1'
          : 'border-border/60 bg-card/60 hover:border-border/90'
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="rounded-md px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-md">
            {plan.badge}
          </Badge>
        </div>
      )}

      <div>
        <div className="mb-6">
          <p className="text-muted-foreground mb-2 text-xs font-bold tracking-wider uppercase">
            {plan.name}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
              {plan.price}
            </span>
            {plan.period && (
              <span className="text-muted-foreground text-xs font-medium">
                {plan.period}
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
            {plan.description}
          </p>
        </div>

        <div className="mb-8 space-y-3">
          {plan.features.map((f, index) => (
            <div key={index} className="flex items-start gap-2.5 text-xs">
              {f.status === 'check' ? (
                <Check className="text-primary mt-0.5 size-4 shrink-0" />
              ) : (
                <X className="text-muted-foreground/30 mt-0.5 size-4 shrink-0" />
              )}
              <span
                className={`leading-relaxed ${
                  f.status === 'check'
                    ? 'text-foreground/90 font-medium'
                    : 'text-muted-foreground/40 line-through'
                }`}
              >
                {f.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant={plan.highlighted ? 'default' : 'outline'}
        className={`h-11 w-full rounded-lg text-sm font-semibold transition-all ${
          plan.highlighted
            ? 'shadow-primary/20 shadow-md'
            : 'border-border/60 hover:bg-muted/60'
        }`}
      >
        {plan.cta}
      </Button>
    </div>
  )
}

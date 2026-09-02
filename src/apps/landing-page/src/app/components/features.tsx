'use client'

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
    tag: 'Observability',
    problem:
      'You never know where your engineering hours actually went at the end of the day',
    title: 'Deep Work metrics and focus tracking with minute granularity',
    description:
      'Spot context switching, measure uninterrupted coding sessions, and visualize your real effort distribution between bug fixes, features, and meetings.',
    highlights: [
      'Daily Deep Work focus score',
      'Context switching frequency detection',
      '100% computed locally without cloud telemetry',
    ],
    accentColor: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10',
  },
  {
    icon: <Layers className="size-5" />,
    tag: 'Unified Hub',
    problem:
      'Tasks scattered across 15 slow browser tabs in different issue trackers',
    title: 'One fast desktop view for tickets from multiple DataSources',
    description:
      'Query and interact with your Jira, Redmine, GitHub, and YouTrack tickets directly from your desktop. Update status and link commits without opening heavy web apps.',
    highlights: [
      'Global instant search (⌘K / Ctrl+K)',
      'Direct branch & PR correlations',
      'Bi-directional status & progress updates',
    ],
    accentColor: 'border-sky-500/30 text-sky-500 bg-sky-500/10',
  },
  {
    icon: <Timer className="size-5" />,
    tag: 'Ergonomic Tracking',
    problem:
      'Manual timesheet filling is tedious, bureaucratic, and easy to forget',
    title: 'Frictionless time logging designed to preserve your flow state',
    description:
      'Start and pause global timers with single-key shortcuts. Attach technical notes, auto-link issue IDs, and sync your time entries to remote trackers in the background.',
    highlights: [
      'Dockable timer bar (Top, Bottom, Left, Right)',
      'Multiple simultaneous timer support',
      'Offline queue with background sync engine',
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
          <div className="border-primary/20 bg-primary/5 text-primary mb-3 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold">
            <Sparkles className="size-3.5" />
            Engineering &amp; Flow
          </div>

          <h2 className="text-foreground mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Built by developers, for developers.
          </h2>

          <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
            More than a simple stopwatch. A complete local-first toolkit to
            manage tasks, track hours, and maximize your technical focus.
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

                {/* Tag & Icon */}
                <div className="mb-4 flex items-center gap-2.5">
                  <span
                    className={`inline-flex size-9 items-center justify-center rounded-lg border ${feature.accentColor}`}
                  >
                    {feature.icon}
                  </span>
                  <span className="text-muted-foreground font-mono text-xs font-semibold tracking-wider uppercase">
                    {feature.tag}
                  </span>
                </div>

                <h3 className="text-foreground mb-2.5 text-lg leading-snug font-bold">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground text-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Highlights */}
              <ul className="border-border/40 mt-6 space-y-2 border-t pt-4">
                {feature.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="text-muted-foreground flex items-center gap-2 text-xs"
                  >
                    <CheckCircle className="size-3.5 shrink-0 text-emerald-500" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

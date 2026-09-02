'use client'

import {
  CalendarDays,
  CheckCircle2,
  Cpu,
  GitPullRequest,
  Layers,
  XCircle,
} from 'lucide-react'
import * as React from 'react'

export function Positioning() {
  return (
    <section
      id="positioning"
      className="bg-background relative overflow-hidden py-24 lg:py-32"
    >
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="bg-primary/5 h-[400px] w-[600px] rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="border-primary/25 bg-primary/5 text-primary mb-3.5 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold">
            <Cpu className="size-3.5" />
            Core Positioning
          </div>

          <h2 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            One private cockpit for all your engineering context.
          </h2>

          <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
            Stop jumping across dozens of browser tabs. Unify remote tickets,
            local tasks, PR code reviews, calendar meetings, and time logs into
            one single dashboard — with 100% of your data saved securely on your
            computer.
          </p>
        </div>

        {/* 3 Pillars of Context Aggregation */}
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          <div className="border-border/60 bg-card/60 rounded-lg border p-6 backdrop-blur-sm">
            <div className="bg-primary/10 text-primary mb-4 flex size-10 items-center justify-center rounded-lg">
              <Layers className="size-5" />
            </div>
            <h3 className="text-foreground text-base font-bold">
              Remote Tickets &amp; Local Tasks
            </h3>
            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
              Consolidate issues from Jira, Redmine, and YouTrack alongside your
              own private local to-do items without switching windows.
            </p>
          </div>

          <div className="border-border/60 bg-card/60 rounded-lg border p-6 backdrop-blur-sm">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
              <GitPullRequest className="size-5" />
            </div>
            <h3 className="text-foreground text-base font-bold">
              Code Reviews &amp; PRs
            </h3>
            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
              Link GitHub and GitLab Pull Requests directly to active work items
              and track review effort and branch activity with precision.
            </p>
          </div>

          <div className="border-border/60 bg-card/60 rounded-lg border p-6 backdrop-blur-sm">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <CalendarDays className="size-5" />
            </div>
            <h3 className="text-foreground text-base font-bold">
              Meetings &amp; Calendar Agenda
            </h3>
            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
              Import scheduled meetings and daily calendar events to convert
              meeting hours into logged time entries in a single click.
            </p>
          </div>
        </div>

        {/* Comparison Cards Grid */}
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {/* Card 1: What Mr. Tick is NOT */}
          <div className="border-destructive/20 bg-destructive/5 hover:border-destructive/30 relative flex flex-col justify-between rounded-lg border p-8 backdrop-blur-sm transition-all">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-destructive/15 text-destructive flex size-10 items-center justify-center rounded-lg">
                  <XCircle className="size-5" />
                </div>
                <div>
                  <h3 className="text-foreground text-lg font-bold">
                    What Mr. Tick is NOT
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    We don&apos;t add bloat or replace your team&apos;s source
                    of truth
                  </p>
                </div>
              </div>

              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <XCircle className="text-destructive mt-0.5 size-4 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground font-semibold">
                      Not a replacement for your issue tracker:
                    </strong>{' '}
                    Your team keeps using Jira, Redmine, or GitHub as the source
                    of truth.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <XCircle className="text-destructive mt-0.5 size-4 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground font-semibold">
                      Not a heavy, slow web app:
                    </strong>{' '}
                    No endless loading spinners or browser tabs eating up your
                    RAM while you write code.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <XCircle className="text-destructive mt-0.5 size-4 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground font-semibold">
                      Not cloud surveillance:
                    </strong>{' '}
                    Zero employee monitoring, zero keystroke logging, and zero
                    data sent to third-party telemetry servers.
                  </span>
                </li>
              </ul>
            </div>

            <div className="border-destructive/15 mt-8 border-t pt-4">
              <span className="text-muted-foreground/70 font-mono text-[11px]">
                Zero clutter &middot; Zero friction &middot; 100% focused on
                execution
              </span>
            </div>
          </div>

          {/* Card 2: What Mr. Tick DOES */}
          <div className="border-primary/25 bg-card/80 hover:border-primary/40 relative flex flex-col justify-between rounded-lg border p-8 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-foreground text-lg font-bold">
                    What Mr. Tick DOES
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Local-first execution and unified workflow cockpit
                  </p>
                </div>
              </div>

              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground font-semibold">
                      Local data consolidation:
                    </strong>{' '}
                    Everything is saved locally on your computer. Unify Jira
                    &amp; Redmine issues, private local tasks, meetings, and
                    time entries in one single, responsive dashboard.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground font-semibold">
                      Two-way background sync:
                    </strong>{' '}
                    Fetch assigned tickets and push time logs automatically back
                    to your company&apos;s trackers without breaking your flow
                    state.
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground font-semibold">
                      Deep Work Observability:
                    </strong>{' '}
                    Measure uninterrupted coding blocks, track context switches,
                    and gain clear visibility into your technical day.
                  </span>
                </li>
              </ul>
            </div>

            <div className="border-border/50 mt-8 border-t pt-4">
              <span className="text-primary font-mono text-[11px] font-medium">
                Local-First &middot; Open Core &middot; Built with TypeScript
                &amp; React
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

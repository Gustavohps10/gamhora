'use client'

import { motion } from 'motion/react'
import * as React from 'react'

interface IntegrationNode {
  id: string
  name: string
  iconSrc: string
  title: string
  subtitle: string
  badge: string
  time: string
  side: 'left' | 'right'
  position: {
    top?: string
    bottom?: string
    left?: string
    right?: string
  }
  delay: number
  floatOffset: number
}

const INTEGRATIONS: IntegrationNode[] = [
  // 1. Top Left - Discord
  {
    id: 'discord-top-left',
    name: 'Discord',
    iconSrc:
      'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/discord.svg',
    title: 'War Room #prod-release',
    subtitle: '4 devs connected in voice',
    badge: 'Active Voice',
    time: '35m',
    side: 'left',
    position: { top: '8%', left: '-270px' },
    delay: 0.2,
    floatOffset: 8,
  },
  // 2. Bottom Left - Outlook Calendar
  {
    id: 'outlook-bottom-left',
    name: 'Outlook Calendar',
    iconSrc:
      'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/microsoft-outlook.svg',
    title: 'Sprint Planning',
    subtitle: 'Corporate Calendar',
    badge: 'In 15 min',
    time: '45m',
    side: 'left',
    position: { bottom: '12%', left: '-270px' },
    delay: 0.6,
    floatOffset: 7,
  },
  // 3. Top Right - Jira
  {
    id: 'jira-top-right',
    name: 'Jira Software',
    iconSrc: '/ui/temp-plugins-icons/jira.png',
    title: 'PROJ-104 · Memory Leak',
    subtitle: 'Sprint 24 · Backend Engine',
    badge: 'In Progress',
    time: '1h 45m',
    side: 'right',
    position: { top: '2%', right: '-270px' },
    delay: 0.3,
    floatOffset: 9,
  },
  // 4. Middle Right - GitLab
  {
    id: 'gitlab-mid-right',
    name: 'GitLab',
    iconSrc:
      'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/gitlab.svg',
    title: 'MR !412 · Core Engine',
    subtitle: 'Pipeline #9182 Passed',
    badge: 'Merged',
    time: '50m',
    side: 'right',
    position: { top: '40%', right: '-270px' },
    delay: 0.5,
    floatOffset: 8,
  },
  // 5. Bottom Right - Redmine
  {
    id: 'redmine-bottom-right',
    name: 'Redmine',
    iconSrc: '/ui/temp-plugins-icons/redmine.png',
    title: '#8492 · Auth Refactoring',
    subtitle: 'High Priority · Core API',
    badge: 'Synchronized',
    time: '2h 10m',
    side: 'right',
    position: { bottom: '4%', right: '-270px' },
    delay: 0.7,
    floatOffset: 8,
  },
]

export function HeroFloatingIntegrations() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 hidden 2xl:block">
      {INTEGRATIONS.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -item.floatOffset, 0],
          }}
          transition={{
            opacity: { duration: 0.8, delay: item.delay },
            scale: { duration: 0.8, delay: item.delay },
            y: {
              duration: 5 + item.delay * 2,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            },
          }}
          style={item.position}
          className="pointer-events-auto absolute z-30"
        >
          {/* Card Glassmorphism Monocromático com Logos Homarr-Labs (max rounded-lg) */}
          <div className="group border-border/80 bg-card/95 hover:border-foreground/40 relative flex w-60 items-center gap-3 rounded-lg border p-3 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            {/* Ambient Monochrome Hover Glow */}
            <div className="from-foreground/10 via-foreground/5 absolute -inset-0.5 rounded-lg bg-gradient-to-r to-transparent opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />

            {/* Official App Icon Box */}
            <div className="border-border/60 bg-muted/60 relative flex size-10 shrink-0 items-center justify-center rounded-lg border shadow-xs">
              <img
                src={item.iconSrc}
                alt={item.name}
                className="size-6 object-contain"
                loading="eager"
              />

              {/* Status Pulse Dot */}
              <span className="absolute -top-1 -right-1 flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
            </div>

            {/* Card Metadata in English */}
            <div className="relative min-w-0 flex-1 text-left">
              <div className="flex items-center justify-between gap-1">
                <span className="text-foreground truncate text-xs font-semibold tracking-tight">
                  {item.title}
                </span>
                <span className="text-muted-foreground font-mono text-[10px] font-bold">
                  {item.time}
                </span>
              </div>

              <p className="text-muted-foreground/80 truncate text-[11px]">
                {item.subtitle}
              </p>

              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="border-border/60 bg-muted/60 text-foreground/80 inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-medium">
                  {item.badge}
                </span>
                <span className="text-muted-foreground/60 font-mono text-[9px]">
                  Auto-Sync
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

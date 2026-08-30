'use client'

import { Separator } from '@pandhora/ui/components'
import { Github, Linkedin, Twitter } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

const FOOTER_SECTIONS = [
  {
    title: 'Produto',
    links: [
      { label: 'Funcionalidades', href: '/#features' },
      { label: 'Integrações', href: '/#integrations' },
      { label: 'Arquitetura', href: '/#offline' },
      { label: 'Preços', href: '/#pricing' },
      { label: 'Demonstração', href: '/#demo' },
    ],
  },
  {
    title: 'Recursos & Docs',
    links: [
      { label: 'Documentação', href: '/docs' },
      { label: 'Guia Rápido', href: '/docs/quickstart' },
      { label: 'SDK de Plugins', href: '/docs/apis/storage-and-events' },
      {
        label: 'Repositório GitHub',
        href: 'https://github.com/gustavohps10/pandhora',
        external: true,
      },
      {
        label: 'Reportar Issue',
        href: 'https://github.com/gustavohps10/pandhora/issues',
        external: true,
      },
    ],
  },
  {
    title: 'Legal & Privacidade',
    links: [
      {
        label: 'Licença MIT (Open Source)',
        href: 'https://github.com/gustavohps10/pandhora/blob/main/LICENSE',
        external: true,
      },
      { label: 'Termos de Uso', href: '#' },
      { label: 'Política de Privacidade', href: '#' },
      { label: 'Segurança Local-first', href: '/#offline' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-border/60 bg-card/60 relative border-t pt-16 pb-12">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-auto shrink-0 items-center justify-center">
                <Image
                  src="/logo-icon.svg"
                  alt="Logo Pandhora"
                  width={28}
                  height={34}
                  className="h-8 w-auto object-contain dark:invert"
                />
              </div>

              <Image
                src="/logo-text.svg"
                alt="Pandhora"
                width={124}
                height={26}
                className="h-auto w-[124px] object-contain dark:invert"
              />
            </Link>

            <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed">
              O workflow toolkit local-first para engenharia de software.
              Controle tarefas, acompanhe horas com precisão e ganhe
              observabilidade total sobre seu tempo técnico.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://github.com/gustavohps10/pandhora"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="border-border/60 bg-background hover:text-foreground text-muted-foreground hover:border-border flex size-9 items-center justify-center rounded-lg border transition-all"
              >
                <Github className="size-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="border-border/60 bg-background hover:text-foreground text-muted-foreground hover:border-border flex size-9 items-center justify-center rounded-lg border transition-all"
              >
                <Twitter className="size-4" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="border-border/60 bg-background hover:text-foreground text-muted-foreground hover:border-border flex size-9 items-center justify-center rounded-lg border transition-all"
              >
                <Linkedin className="size-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-foreground text-xs font-bold tracking-wider uppercase">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noreferrer' : undefined}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10 opacity-40" />

        {/* Bottom copyright */}
        <div className="text-muted-foreground/60 flex flex-col items-center justify-between gap-4 text-xs sm:flex-row">
          <p>© 2026 Pandhora. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
            <span>
              Engenharia local-first &middot; Feito para desenvolvedores
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

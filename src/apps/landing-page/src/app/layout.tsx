import '../index.css'

import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mr-tick — Apontamento de Horas Inteligente',
  description:
    'Controle cada minuto do seu time com integrações poderosas. Jira, Redmine, Trello, Slack, GitHub e Asana em um só lugar.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistMono.variable} h-full font-mono antialiased`}
    >
      <body
        className="flex min-h-full flex-col font-mono"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

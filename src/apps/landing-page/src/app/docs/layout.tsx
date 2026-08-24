import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { RootProvider } from 'fumadocs-ui/provider/next'
import type { ReactNode } from 'react'

import { Navbar } from '@/app/page'
import { source } from '@/lib/source'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider theme={{ enabled: false }}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 pt-16">
          <DocsLayout
            tree={source.pageTree}
            nav={{ enabled: false }}
            sidebar={{
              collapsible: false,
              footer: null,
            }}
          >
            {children}
          </DocsLayout>
        </div>
      </div>
    </RootProvider>
  )
}

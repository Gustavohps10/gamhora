import * as React from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar()

  return (
    <aside
      className={cn(
        'border-border/60 bg-sidebar text-sidebar-foreground z-30 flex h-full shrink-0 flex-col overflow-hidden border-r transition-[width] duration-200 ease-in-out select-none',
        open ? 'w-[240px]' : 'w-[54px]',
      )}
    >
      <div
        className={cn(
          'flex h-full flex-col overflow-hidden transition-[width] duration-200 ease-in-out',
          open ? 'w-[240px]' : 'w-[54px]',
        )}
      >
        {children}
      </div>
    </aside>
  )
}

export function AppSidebarHeader({ children }: { children?: React.ReactNode }) {
  return <SidebarHeader className="z-40 p-0">{children}</SidebarHeader>
}

export function AppSidebarContent({
  children,
}: {
  children?: React.ReactNode
}) {
  return (
    <SidebarContent className="z-40">
      <ScrollArea className="h-full">{children}</ScrollArea>
    </SidebarContent>
  )
}

export function AppSidebarFooter({ children }: { children?: React.ReactNode }) {
  return <SidebarFooter className="mb-12 p-0">{children}</SidebarFooter>
}

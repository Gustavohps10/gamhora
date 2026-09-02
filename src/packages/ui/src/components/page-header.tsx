import { ChevronRight } from 'lucide-react'
import * as React from 'react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function PageHeader({ className, children, ...props }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3 pb-4', className)} {...props}>
      {children}
    </div>
  )
}

export interface PageHeaderBreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface PageHeaderBreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: PageHeaderBreadcrumbItem[]
}

export function PageHeaderBreadcrumb({
  items,
  className,
  ...props
}: PageHeaderBreadcrumbProps) {
  if (!items || items.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'text-muted-foreground/80 flex items-center gap-1.5 text-xs select-none',
        className,
      )}
      {...props}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const Icon = item.icon

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <ChevronRight className="text-muted-foreground/40 size-3 shrink-0" />
            )}

            <div className="flex items-center gap-1.5">
              {Icon && <Icon className="size-3.5 shrink-0 opacity-70" />}
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground/80',
                  )}
                >
                  {item.label}
                </span>
              )}
            </div>
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export interface PageHeaderRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function PageHeaderRow({
  className,
  children,
  ...props
}: PageHeaderRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface PageHeaderHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ComponentType<{ className?: string }>
  children?: React.ReactNode
}

export function PageHeaderHeading({
  icon: Icon,
  className,
  children,
  ...props
}: PageHeaderHeadingProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)} {...props}>
      {Icon && (
        <div className="bg-muted/40 text-muted-foreground border-border/50 flex size-8 shrink-0 items-center justify-center rounded-lg border shadow-2xs">
          <Icon className="size-4" />
        </div>
      )}
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

export interface PageHeaderTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

export function PageHeaderTitle({
  className,
  children,
  ...props
}: PageHeaderTitleProps) {
  return (
    <h1
      className={cn(
        'text-foreground text-lg font-semibold tracking-tight sm:text-xl',
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  )
}

export interface PageHeaderDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export function PageHeaderDescription({
  className,
  children,
  ...props
}: PageHeaderDescriptionProps) {
  return (
    <p
      className={cn('text-muted-foreground text-xs leading-normal', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export interface PageHeaderActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function PageHeaderActions({
  className,
  children,
  ...props
}: PageHeaderActionsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {children}
    </div>
  )
}

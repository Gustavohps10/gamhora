'use client'

import { Outlet } from 'react-router-dom'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

import { AddonCategorySidebar } from '../pages/addons/components/addon-category-sidebar'

export function AddonsLayout() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Addons & Integrações
        </h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Workspace</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Addons</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-1 overflow-hidden pt-4">
        {/* Sidebar for Store vs Capability Settings */}
        <div className="w-[220px] flex-shrink-0 border-r pr-4">
          <AddonCategorySidebar />
        </div>

        {/* Right Content Area */}
        <div className="flex h-full flex-1 flex-col overflow-y-auto pl-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

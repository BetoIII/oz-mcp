'use client'

import { ReactNode } from 'react'
import { Navbar } from '@/components/Navbar'

interface DashboardClientProps {
  children: ReactNode
}

export function DashboardClient({ children }: DashboardClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar variant="dashboard" title="Developer Dashboard" />
      {children}
    </div>
  )
} 
'use client'

import { ReactNode } from 'react'
import { Navbar } from '@/components/Navbar'
import { Database } from 'lucide-react'

interface DashboardClientProps {
  children: ReactNode
}

export function DashboardClient({ children }: DashboardClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar variant="dashboard" icon={<Database className="h-5 w-5 text-white" />} title="Developer Dashboard" />
      {children}
    </div>
  )
} 
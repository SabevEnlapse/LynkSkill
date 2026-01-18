"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardProvider } from "@/lib/dashboard-context"

export default function StudentDashboard() {
  return (
    <DashboardProvider userType="Student">
      <DashboardLayout userType="Student" />
    </DashboardProvider>
  )
}

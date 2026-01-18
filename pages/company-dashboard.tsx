"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardProvider } from "@/lib/dashboard-context"

export default function CompanyDashboard() {
  return (
    <DashboardProvider userType="Company">
      <DashboardLayout userType="Company" />
    </DashboardProvider>
  )
}

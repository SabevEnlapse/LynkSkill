"use client"

import {DashboardLayout} from "@/components/dashboard-layout"
import RequireAuth from "@/components/RequireAuth"

export default function CompanyDashboard() {
    return (
        <RequireAuth>
            <DashboardLayout userType="Company"/>
        </RequireAuth>
    )
}

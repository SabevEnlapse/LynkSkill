"use client"

import {DashboardLayout} from "@/components/dashboard-layout"
import RequireAuth from "@/components/RequireAuth"

export default function StudentDashboard() {
    return (
        <RequireAuth>
            <DashboardLayout userType="Student"/>
        </RequireAuth>
    )
}

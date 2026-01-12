import { DashboardLayout } from "@/components/dashboard-layout"

export const dynamic = "force-dynamic";

export default function StudentDashboard() {
    return (
            <DashboardLayout userType="Student" />
    )
}

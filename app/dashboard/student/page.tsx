import { getDashboardData } from "@/lib/server-data"
import { DashboardProvider } from "@/lib/dashboard-context"
import { DashboardLayout } from "@/components/dashboard-layout"

// Enable ISR with 60 second revalidation for better performance
export const revalidate = 60

export default async function StudentDashboard() {
    // Fetch all data server-side in parallel
    const initialData = await getDashboardData("Student")
    
    // Transform dates to strings for client serialization
    const serializedData = {
        user: initialData.user,
        company: initialData.company,
        internships: initialData.internships.map(i => ({
            ...i,
            createdAt: i.createdAt.toISOString(),
            applicationStart: i.applicationStart?.toISOString() ?? null,
            applicationEnd: i.applicationEnd?.toISOString() ?? null,
        })),
        applications: initialData.applications.map(a => ({
            ...a,
            createdAt: a.createdAt.getTime(),
        })),
        projects: initialData.projects.map(p => ({
            ...p,
            createdAt: p.createdAt.toISOString(),
            status: "ONGOING" as const,
            internship: {
                ...p.internship,
                startDate: p.internship.startDate?.toISOString() ?? null,
                endDate: p.internship.endDate?.toISOString() ?? null,
            }
        })),
        recentExperiences: initialData.recentExperiences.map(e => ({
            ...e,
            createdAt: e.createdAt.toISOString(),
        })),
    }

    return (
        <DashboardProvider userType="Student" initialData={serializedData}>
            <DashboardLayout userType="Student" />
        </DashboardProvider>
    )
}

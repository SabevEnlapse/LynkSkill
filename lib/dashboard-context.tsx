"use client"

import React, { createContext, useContext, useCallback, useMemo } from "react"
import useSWR, { SWRConfiguration } from "swr"
import type { Internship, Application } from "@/app/types"

// ============ Types ============
interface Project {
    id: string
    title: string
    createdAt: string
    internshipId: string
    studentId: string
    status: "ONGOING" | "COMPLETED" | "PENDING"
    application?: { status: string } | null
    internship: {
        id: string
        title: string
        applicationStart?: string | null
        applicationEnd?: string | null
        startDate?: string | null
        endDate?: string | null
        company: { name: string }
        assignments?: Array<{
            studentId: string
            title: string
            description: string
            dueDate: string
        }>
    }
    student: {
        email: string
        name?: string
        profile?: { name: string } | null
    }
}

interface RecentExperience {
    id: string
    files: { url: string }[]
    createdAt: string
    uploader: {
        name: string
        image: string | null
    }
    isBulk: boolean
}

interface UserData {
    id: string
    clerkId: string
    email: string
    role: "STUDENT" | "COMPANY"
    introShown: boolean
    profile?: {
        name: string
    }
}

interface CompanyData {
    id: string
    name: string
    logo: string | null
}

interface DashboardContextType {
    // User data
    user: UserData | null
    isLoadingUser: boolean
    
    // Company data (for company users)
    company: CompanyData | null
    isLoadingCompany: boolean
    
    // Internships
    internships: Internship[]
    isLoadingInternships: boolean
    mutateInternships: () => void
    
    // Applications
    applications: Application[]
    isLoadingApplications: boolean
    mutateApplications: () => void
    
    // Projects
    projects: Project[]
    isLoadingProjects: boolean
    mutateProjects: () => void
    
    // Recent experiences
    recentExperiences: RecentExperience[]
    isLoadingExperiences: boolean
    
    // Global loading state
    isInitialLoading: boolean
    
    // Refetch all data
    refreshAll: () => Promise<void>
}

// ============ Context ============
const DashboardContext = createContext<DashboardContextType | null>(null)

// ============ Fetcher ============
const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        const error = new Error("Failed to fetch data")
        throw error
    }
    return res.json()
}

// ============ SWR Config ============
const swrConfig: SWRConfiguration = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // Dedupe requests within 60 seconds
    errorRetryCount: 2,
    keepPreviousData: true,
}

// ============ Provider Props ============
interface DashboardProviderProps {
    children: React.ReactNode
    userType: "Student" | "Company"
    initialData?: {
        user?: UserData | null
        company?: CompanyData | null
        internships?: Internship[]
        applications?: Application[]
        projects?: Project[]
        recentExperiences?: RecentExperience[]
    }
}

// ============ Provider ============
export function DashboardProvider({ 
    children, 
    userType, 
    initialData 
}: DashboardProviderProps) {
    // User data
    const { 
        data: user, 
        isLoading: isLoadingUser,
        mutate: mutateUser 
    } = useSWR<UserData>(
        "/api/user/me",
        fetcher,
        { 
            ...swrConfig, 
            fallbackData: initialData?.user ?? undefined,
        }
    )

    // Company data (only for company users)
    const { 
        data: company, 
        isLoading: isLoadingCompany,
        mutate: mutateCompany 
    } = useSWR<CompanyData>(
        userType === "Company" ? "/api/company/me" : null,
        fetcher,
        { 
            ...swrConfig, 
            fallbackData: initialData?.company ?? undefined,
        }
    )

    // Internships
    const { 
        data: internships, 
        isLoading: isLoadingInternships,
        mutate: mutateInternships 
    } = useSWR<Internship[]>(
        "/api/internships",
        fetcher,
        { 
            ...swrConfig, 
            fallbackData: initialData?.internships ?? [],
        }
    )

    // Applications
    const applicationsUrl = userType === "Student" 
        ? "/api/applications/me" 
        : "/api/applications/company"
    
    const { 
        data: applications, 
        isLoading: isLoadingApplications,
        mutate: mutateApplications 
    } = useSWR<Application[]>(
        applicationsUrl,
        fetcher,
        { 
            ...swrConfig, 
            fallbackData: initialData?.applications ?? [],
        }
    )

    // Projects
    const { 
        data: projects, 
        isLoading: isLoadingProjects,
        mutate: mutateProjects 
    } = useSWR<Project[]>(
        "/api/projects",
        fetcher,
        { 
            ...swrConfig, 
            fallbackData: initialData?.projects ?? [],
        }
    )

    // Recent experiences
    const { 
        data: recentExperiences, 
        isLoading: isLoadingExperiences,
        mutate: mutateExperiences 
    } = useSWR<RecentExperience[]>(
        "/api/experience/recent-files",
        fetcher,
        { 
            ...swrConfig, 
            fallbackData: initialData?.recentExperiences ?? [],
        }
    )

    // Refresh all data
    const refreshAll = useCallback(async () => {
        await Promise.all([
            mutateUser(),
            userType === "Company" ? mutateCompany() : Promise.resolve(),
            mutateInternships(),
            mutateApplications(),
            mutateProjects(),
            mutateExperiences(),
        ])
    }, [mutateUser, mutateCompany, mutateInternships, mutateApplications, mutateProjects, mutateExperiences, userType])

    // Global loading state (only true on first load without fallback data)
    const isInitialLoading = useMemo(() => {
        const hasInitialData = initialData && (
            initialData.user || 
            initialData.internships?.length || 
            initialData.applications?.length
        )
        if (hasInitialData) return false
        return isLoadingUser || isLoadingInternships
    }, [initialData, isLoadingUser, isLoadingInternships])

    const value = useMemo<DashboardContextType>(() => ({
        user: user ?? null,
        isLoadingUser,
        company: company ?? null,
        isLoadingCompany,
        internships: internships ?? [],
        isLoadingInternships,
        mutateInternships: () => mutateInternships(),
        applications: applications ?? [],
        isLoadingApplications,
        mutateApplications: () => mutateApplications(),
        projects: projects ?? [],
        isLoadingProjects,
        mutateProjects: () => mutateProjects(),
        recentExperiences: recentExperiences ?? [],
        isLoadingExperiences,
        isInitialLoading,
        refreshAll,
    }), [
        user, isLoadingUser,
        company, isLoadingCompany,
        internships, isLoadingInternships, mutateInternships,
        applications, isLoadingApplications, mutateApplications,
        projects, isLoadingProjects, mutateProjects,
        recentExperiences, isLoadingExperiences,
        isInitialLoading, refreshAll,
    ])

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    )
}

// ============ Hook ============
export function useDashboard() {
    const context = useContext(DashboardContext)
    if (!context) {
        throw new Error("useDashboard must be used within a DashboardProvider")
    }
    return context
}

// Export types
export type { 
    DashboardContextType, 
    UserData, 
    CompanyData, 
    Project, 
    RecentExperience 
}

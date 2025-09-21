export interface Internship {
    id: string
    companyId: string
    title: string
    description: string
    qualifications?: string | null
    location: string
    paid: boolean
    salary?: number | null
    createdAt: string
}

export interface Application {
    id: string
    status: "PENDING" | "APPROVED" | "REJECTED"
    studentId: string
    internshipId: string
    student?: {
        id: string
        email: string
        profile?: { name: string }
    }
    internship?: {
        id: string
        title: string
        company?: { id: string; name: string }
    }
}

export interface Portfolio {
    id: string
    studentId: string
    skills: string[]
    interests: string[]
    experience?: string | null
    projects?: {
        title: string
        description?: string
        link?: string
    }[]
    createdAt: string
    updatedAt: string
}
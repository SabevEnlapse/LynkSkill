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
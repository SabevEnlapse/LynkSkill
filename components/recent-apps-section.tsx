"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Internship } from "@/app/types"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { CardSkeleton } from "@/components/card-skeleton"
import { InternshipDetailsModal } from "@/components/internship-details-modal"
import { Trash2 } from "lucide-react"
import ApplyButton from "@/components/ApplyBtn"

interface Application {
    id: string
    internshipId: string
    studentId: string
    status: "PENDING" | "APPROVED" | "REJECTED"
}

interface RecentAppsSectionProps {
    userType: "Student" | "Company"
    internships?: Internship[]
}

export function RecentAppsSection({ userType, internships = [] }: RecentAppsSectionProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
    const [applications, setApplications] = useState<Application[]>([])

    const sectionTitle = userType === "Company" ? "My Recent Internships" : "Recent Internships"

    // Fetch applications if student
    useEffect(() => {
        const load = async () => {
            if (userType === "Student") {
                try {
                    const res = await fetch("/api/applications/me")
                    if (res.ok) {
                        const data = await res.json()
                        setApplications(data)
                    }
                } catch (err) {
                    console.error("Failed to fetch applications", err)
                }
            }
            setIsLoading(false)
        }
        load()
    }, [userType])

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{sectionTitle}</h2>
                <Button variant="ghost" className="rounded-2xl">View All</Button>
            </div>

            {internships.length === 0 && !isLoading ? (
                <p className="text-muted-foreground">No internships yet.</p>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {isLoading
                        ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                        : internships.map((item: Internship) => {
                            const app = applications.find(a => a.internshipId === item.id)

                            return (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Card className="flex flex-col overflow-hidden rounded-3xl border-2 hover:border-primary/50 transition-all duration-300 h-full">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                                                    {userType === "Company" ? "🏢" : "📌"}
                                                </div>
                                                {userType === "Company" && (
                                                    <button
                                                        onClick={async () => {
                                                            const confirm = window.confirm(
                                                                "Are you sure you want to delete this internship?"
                                                            )
                                                            if (!confirm) return

                                                            try {
                                                                const res = await fetch("/api/internships", {
                                                                    method: "DELETE",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({ id: item.id }),
                                                                })
                                                                const data = await res.json()
                                                                if (data.error) throw new Error(data.error)

                                                                // notify parent
                                                                window.dispatchEvent(
                                                                    new CustomEvent("internshipDeleted", { detail: item.id })
                                                                )
                                                            } catch (err) {
                                                                console.error(err)
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-5 h-5 text-red-500" />
                                                    </button>
                                                )}
                                            </div>
                                        </CardHeader>

                                        <CardContent className="flex-1 flex flex-col w-full gap-2 break-words">
                                            <CardTitle className="text-lg">{item.title}</CardTitle>
                                            <CardDescription className="text-sm text-muted-foreground">
                                                {item.description}
                                            </CardDescription>
                                            <div className="mt-1 text-sm text-muted-foreground">
                                                📍 {item.location}
                                                {item.qualifications && ` • 🎓 ${item.qualifications}`}
                                                {item.paid && ` • 💰 ${item.salary ?? "Negotiable"}`}
                                            </div>
                                        </CardContent>

                                        <CardFooter className="w-fit">
                                            {userType === "Student" ? (
                                                app ? (
                                                    <Button
                                                        variant={
                                                            app.status === "APPROVED"
                                                                ? "default"
                                                                : app.status === "REJECTED"
                                                                    ? "destructive"
                                                                    : "outline"
                                                        }
                                                        disabled
                                                        className="w-full rounded-2xl"
                                                    >
                                                        {app.status === "PENDING" && "Applied ✅"}
                                                        {app.status === "APPROVED" && "Approved 🎉"}
                                                        {app.status === "REJECTED" && "Rejected ❌"}
                                                    </Button>
                                                ) : (
                                                    <ApplyButton internshipId={item.id} />
                                                )
                                            ) : (
                                                <Button
                                                    variant="secondary"
                                                    className="w-full rounded-2xl"
                                                    onClick={() => setSelectedInternship(item)}
                                                >
                                                    Manage
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>

                                    <InternshipDetailsModal
                                        open={!!selectedInternship && selectedInternship.id === item.id}
                                        onClose={() => setSelectedInternship(null)}
                                        internship={selectedInternship}
                                        userType={userType}
                                        onUpdate={(updated: Internship) =>
                                            window.dispatchEvent(
                                                new CustomEvent("internshipUpdated", { detail: updated })
                                            )
                                        }
                                    />
                                </motion.div>
                            )
                        })}
                </div>
            )}
        </section>
    )
}

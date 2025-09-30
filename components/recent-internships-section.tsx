"use client"

import { motion } from "framer-motion"
import { useEffect, useState, useCallback } from "react"
import type { Internship } from "@/app/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CardSkeleton } from "@/components/card-skeleton"
import { InternshipDetailsModal } from "@/components/internship-details-modal"
import { Input } from "@/components/ui/input"
import { Layers, Clock, Search, RefreshCw, Trash2 } from "lucide-react"
import ApplyButton from "@/components/ApplyBtn"

interface Application {
    id: string
    internshipId: string
    studentId: string
    status: "PENDING" | "APPROVED" | "REJECTED"
}

interface RecentAppsSectionProps {
    userType: "Student" | "Company"
}

export function RecentInternshipsSection({ userType }: RecentAppsSectionProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const [internships, setInternships] = useState<Internship[]>([])
    const [applications, setApplications] = useState<Application[]>([])
    const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)

    const [searchQuery, setSearchQuery] = useState("")
    const [filter, setFilter] = useState<"all" | "recent">("all")

    const sectionTitle = userType === "Company" ? "My Recent Internships" : "Recent Internships"

    const loadData = useCallback(async () => {
        try {
            // fetch internships
            const resInternships = await fetch("/api/internships")
            if (resInternships.ok) {
                const data = await resInternships.json()
                setInternships(data)
            }

            // fetch applications if student
            if (userType === "Student") {
                const resApps = await fetch("/api/applications/me")
                if (resApps.ok) {
                    const data = await resApps.json()
                    setApplications(data)
                }
            }
        } catch (err) {
            console.error("Failed to fetch data", err)
        } finally {
            setIsLoading(false)
            setRefreshing(false)
        }
    }, [userType])

    // initial load
    useEffect(() => {
        loadData()
    }, [loadData])

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadData()
    }

    const searchLower = searchQuery.toLowerCase()
    const filteredInternships = internships.filter((internship) => {
        return (
            internship.title.toLowerCase().includes(searchLower) ||
            internship.description.toLowerCase().includes(searchLower) ||
            internship.location?.toLowerCase().includes(searchLower) ||
            internship.skills?.toLowerCase().includes(searchLower)
        )
    })

    const now = Date.now()
    const finalInternships =
        filter === "recent"
            ? filteredInternships.filter((internship) => {
                const createdAt = new Date(internship.createdAt).getTime()
                const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24)
                return diffDays <= 5
            })
            : filteredInternships

    return (
        <section className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl p-4 backdrop-blur-sm">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">{sectionTitle}</h2>
                        <p className="text-white/80 text-lg">
                            {finalInternships.length} {finalInternships.length === 1 ? "opportunity" : "opportunities"} available
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm rounded-2xl px-6 py-3 font-semibold transition-all duration-300"
                    >
                        View All
                    </Button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4 mb-6">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    className="rounded-2xl"
                    onClick={() => setFilter("all")}
                >
                    <Layers className="mr-2 h-4 w-4" />
                    All Internships
                </Button>

                <Button
                    variant={filter === "recent" ? "default" : "outline"}
                    className="rounded-2xl"
                    onClick={() => setFilter("recent")}
                >
                    <Clock className="mr-2 h-4 w-4" />
                    Recent
                </Button>

                <div className="flex-1" />

                <div className="relative w-full md:w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search internships..."
                        className="w-full rounded-2xl pl-9 border-2 focus:border-[var(--experience-accent)] transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRefresh}
                    disabled={refreshing || isLoading}
                    className="rounded-2xl"
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    {refreshing ? "Refreshing..." : "Refresh"}
                </Button>
            </div>

            {finalInternships.length === 0 && !isLoading ? (
                <p className="text-muted-foreground">No internships found.</p>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {isLoading
                        ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                        : finalInternships.map((item) => {
                            const app = applications.find((a) => a.internshipId === item.id)

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{
                                        scale: 1.03,
                                        y: -8,
                                        transition: { duration: 0.2 },
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group"
                                >
                                    <Card className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-[var(--internship-card-border)] hover:border-[var(--internship-card-border-hover)] transition-all duration-500 h-full bg-gradient-to-br from-[var(--internship-card-gradient-from)] to-[var(--internship-card-gradient-to)] shadow-lg hover:shadow-[0_20px_40px_var(--internship-card-shadow-hover)] backdrop-blur-sm">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--internship-card-hover-from)] to-[var(--internship-card-hover-to)] opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

                                        <CardHeader className="pb-4 relative z-10">
                                            <div className="flex items-center justify-between">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--internship-card-hover-from)] to-[var(--internship-card-hover-to)] text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    {userType === "Company" ? "🏢" : "📌"}
                                                </div>
                                                {userType === "Company" && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={async () => {
                                                            const confirm = window.confirm("Are you sure you want to delete this internship?")
                                                            if (!confirm) return

                                                            try {
                                                                const res = await fetch("/api/internships", {
                                                                    method: "DELETE",
                                                                    headers: {
                                                                        "Content-Type": "application/json",
                                                                    },
                                                                    body: JSON.stringify({ id: item.id }),
                                                                })
                                                                const data = await res.json()
                                                                if (data.error) throw new Error(data.error)

                                                                window.dispatchEvent(
                                                                    new CustomEvent("internshipDeleted", {
                                                                        detail: item.id,
                                                                    }),
                                                                )
                                                            } catch (err) {
                                                                console.error(err)
                                                            }
                                                        }}
                                                        className="p-2 rounded-xl cursor-pointer bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors duration-200"
                                                    >
                                                        <Trash2 className="w-5 h-5 text-red-500" />
                                                    </motion.button>
                                                )}
                                            </div>
                                        </CardHeader>

                                        <CardContent className="flex-1 flex flex-col w-full gap-3 break-words relative z-10 px-6">
                                            <CardTitle className="text-xl font-bold text-foreground group-hover:text-[var(--internship-card-hover-from)] transition-colors duration-300">
                                                {item.title}
                                            </CardTitle>
                                            <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                                {item.description}
                                            </CardDescription>
                                            <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base">📍</span>
                                                    <span className="font-medium">{item.location}</span>
                                                </div>
                                                {item.qualifications && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base">🎓</span>
                                                        <span>{item.qualifications}</span>
                                                    </div>
                                                )}
                                                {item.paid && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base">💰</span>
                                                        <span className="font-semibold text-green-600 dark:text-green-400">
                                ${item.salary ?? "Negotiable"}
                              </span>
                                                    </div>
                                                )}
                                                {item.duration && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base">⏳</span>
                                                        <span>{item.duration}</span>
                                                    </div>
                                                )}
                                                {item.grade && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base">📖</span>
                                                        <span>Grade: {item.grade}</span>
                                                    </div>
                                                )}
                                                {item.skills && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base">🛠️</span>
                                                        <span>{item.skills}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>

                                        <CardFooter className="w-full flex justify-between items-center gap-3 p-6 relative z-10">
                                            {userType === "Student" ? (
                                                <div className="flex gap-3 w-full">
                                                    {app ? (
                                                        <Button
                                                            variant={
                                                                app.status === "APPROVED"
                                                                    ? "default"
                                                                    : app.status === "REJECTED"
                                                                        ? "destructive"
                                                                        : "outline"
                                                            }
                                                            disabled
                                                            className="flex-1 rounded-2xl py-3 text-foreground font-semibold shadow-md"
                                                            style={{
                                                                backgroundColor:
                                                                    app.status === "PENDING"
                                                                        ? "var(--internship-status-pending)"
                                                                        : app.status === "APPROVED"
                                                                            ? "var(--internship-status-approved)"
                                                                            : "var(--internship-status-rejected)",
                                                            }}
                                                        >
                                                            {app.status === "PENDING" && "Applied ✅"}
                                                            {app.status === "APPROVED" && "Approved 🎉"}
                                                            {app.status === "REJECTED" && "Rejected ❌"}
                                                        </Button>
                                                    ) : (
                                                        <ApplyButton
                                                            internshipId={item.id}
                                                            onApplied={() => {
                                                                fetch("/api/applications/me")
                                                                    .then((res) => res.json())
                                                                    .then((data) => setApplications(data))
                                                                    .catch((err) => console.error(err))
                                                            }}
                                                        />
                                                    )}

                                                    <Button
                                                        variant="secondary"
                                                        className="flex-1 rounded-2xl py-3 font-semibold bg-gradient-to-r from-[var(--internship-card-hover-from)] to-[var(--internship-card-hover-to)] text-white hover:shadow-lg transition-all duration-300"
                                                        onClick={() => setSelectedInternship(item)}
                                                    >
                                                        See More
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="secondary"
                                                    className="w-full rounded-2xl py-3 font-semibold bg-gradient-to-r from-[var(--internship-card-hover-from)] to-[var(--internship-card-hover-to)] text-white hover:shadow-lg transition-all duration-300"
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
                                                new CustomEvent("internshipUpdated", {
                                                    detail: updated,
                                                }),
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

"use client"

import { motion } from "framer-motion"
import { useEffect, useState, useCallback } from "react"
import type { Internship } from "@/app/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CardSkeleton } from "@/components/card-skeleton"
import { InternshipDetailsModal } from "@/components/internship-details-modal"
import { Input } from "@/components/ui/input"
import {
    Layers,
    Clock,
    Search,
    RefreshCw,
    Trash2,
    MapPin,
    GraduationCap,
    DollarSign,
    Timer,
    BookOpen,
    Wrench,
    Building2,
    Briefcase,
    CheckCircle2,
    XCircle,
    Clock3,
    ArrowRight,
    Sparkles,
} from "lucide-react"
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
            const resInternships = await fetch("/api/internships")
            if (resInternships.ok) {
                const data = await resInternships.json()
                setInternships(data)
            }

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
        <section className="space-y-8">
            <div className="relative overflow-hidden rounded-3xl p-10 backdrop-blur-sm shadow-2xl bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-blue-600/5 border border-border/50">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/5 to-blue-600/10" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm shadow-lg">
                                <Briefcase className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h2 className="text-4xl font-bold text-foreground">{sectionTitle}</h2>
                        </div>
                        <p className="text-muted-foreground text-lg font-medium flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            {finalInternships.length} {finalInternships.length === 1 ? "opportunity" : "opportunities"} available
                        </p>
                    </div>
                    <Button
                        size="lg"
                        className="rounded-2xl px-8 py-6 text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white group"
                    >
                        View All
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <div className="flex gap-3">
                    <Button
                        variant={filter === "all" ? "default" : "outline"}
                        size="lg"
                        className="rounded-2xl px-6 py-3 font-bold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                        onClick={() => setFilter("all")}
                    >
                        <Layers className="mr-2 h-5 w-5" />
                        All Internships
                    </Button>

                    <Button
                        variant={filter === "recent" ? "default" : "outline"}
                        size="lg"
                        className="rounded-2xl px-6 py-3 font-bold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                        onClick={() => setFilter("recent")}
                    >
                        <Clock className="mr-2 h-5 w-5" />
                        Recent
                    </Button>
                </div>

                <div className="flex-1" />

                <div className="relative w-full md:w-[320px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search internships..."
                        className="w-full rounded-2xl pl-12 pr-4 py-6 border-2 focus:border-purple-500 transition-all shadow-md focus:shadow-lg text-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Button
                    size="lg"
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={refreshing || isLoading}
                    className="rounded-2xl px-6 py-3 font-bold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg bg-transparent"
                >
                    <RefreshCw className={`mr-2 h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
                    {refreshing ? "Refreshing..." : "Refresh"}
                </Button>
            </div>

            {finalInternships.length === 0 && !isLoading ? (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
                        <Search className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-xl font-medium">No internships found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {isLoading
                        ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
                        : finalInternships.map((item) => {
                            const app = applications.find((a) => a.internshipId === item.id)

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    whileHover={{
                                        scale: 1.03,
                                        y: -8,
                                        transition: { duration: 0.3, ease: "easeOut" },
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group"
                                >
                                    <Card className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-border hover:border-purple-500/50 transition-all duration-500 h-full bg-gradient-to-br from-card via-card to-card/95 shadow-lg hover:shadow-2xl backdrop-blur-sm">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <CardHeader className="pb-4 pt-6 px-6 relative z-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                                    {userType === "Company" ? (
                                                        <Building2 className="h-7 w-7 text-white" />
                                                    ) : (
                                                        <Briefcase className="h-7 w-7 text-white" />
                                                    )}
                                                </div>
                                                {userType === "Company" && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.15 }}
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
                                                        className="p-2.5 rounded-xl cursor-pointer bg-destructive/10 hover:bg-destructive/20 transition-all duration-200 shadow-md hover:shadow-lg"
                                                    >
                                                        <Trash2 className="w-5 h-5 text-destructive" />
                                                    </motion.button>
                                                )}
                                            </div>
                                        </CardHeader>

                                        <CardContent className="flex-1 flex flex-col w-full gap-4 break-words relative z-10 px-6">
                                            <CardTitle className="text-xl font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 leading-tight">
                                                {item.title}
                                            </CardTitle>
                                            <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                                {item.description}
                                            </CardDescription>

                                            <div className="mt-2 space-y-2.5 text-sm">
                                                <div className="flex items-center gap-2.5 text-muted-foreground">
                                                    <div className="p-1.5 rounded-lg bg-purple-500/10">
                                                        <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <span className="font-semibold">{item.location}</span>
                                                </div>
                                                {item.qualifications && (
                                                    <div className="flex items-center gap-2.5 text-muted-foreground">
                                                        <div className="p-1.5 rounded-lg bg-blue-500/10">
                                                            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <span className="line-clamp-1">{item.qualifications}</span>
                                                    </div>
                                                )}
                                                {item.paid && (
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="p-1.5 rounded-lg bg-green-500/10">
                                                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <span className="font-bold text-green-600 dark:text-green-400">
                                ${item.salary ?? "Negotiable"}
                              </span>
                                                    </div>
                                                )}
                                                {item.duration && (
                                                    <div className="flex items-center gap-2.5 text-muted-foreground">
                                                        <div className="p-1.5 rounded-lg bg-purple-500/10">
                                                            <Timer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <span>{item.duration}</span>
                                                    </div>
                                                )}
                                                {item.grade && (
                                                    <div className="flex items-center gap-2.5 text-muted-foreground">
                                                        <div className="p-1.5 rounded-lg bg-blue-500/10">
                                                            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <span>Grade: {item.grade}</span>
                                                    </div>
                                                )}
                                                {item.skills && (
                                                    <div className="flex items-center gap-2.5 text-muted-foreground">
                                                        <div className="p-1.5 rounded-lg bg-purple-500/10">
                                                            <Wrench className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <span className="line-clamp-1">{item.skills}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>

                                        <CardFooter className="w-full flex justify-between items-center gap-3 p-6 relative z-10 border-t border-border/50">
                                            {userType === "Student" ? (
                                                <div className="flex gap-3 w-full">
                                                    {app ? (
                                                        <Button
                                                            disabled
                                                            size="lg"
                                                            className="flex-1 rounded-2xl py-6 font-bold shadow-lg cursor-not-allowed"
                                                            variant={
                                                                app.status === "APPROVED"
                                                                    ? "default"
                                                                    : app.status === "REJECTED"
                                                                        ? "destructive"
                                                                        : "outline"
                                                            }
                                                        >
                                                            {app.status === "PENDING" && (
                                                                <>
                                                                    <Clock3 className="mr-2 h-5 w-5" />
                                                                    Applied
                                                                </>
                                                            )}
                                                            {app.status === "APPROVED" && (
                                                                <>
                                                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                                                    Approved
                                                                </>
                                                            )}
                                                            {app.status === "REJECTED" && (
                                                                <>
                                                                    <XCircle className="mr-2 h-5 w-5" />
                                                                    Rejected
                                                                </>
                                                            )}
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

                                                    {!app && (
                                                        <Button
                                                            size="lg"
                                                            variant="outline"
                                                            className="flex-1 rounded-2xl  font-bold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-xl border-2 hover:border-purple-500 group bg-transparent"
                                                            onClick={() => setSelectedInternship(item)}
                                                        >
                                                            Details
                                                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ) : (
                                                <Button
                                                    size="lg"
                                                    className="w-full rounded-2xl py-6 font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                                                    onClick={() => setSelectedInternship(item)}
                                                >
                                                    Manage
                                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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

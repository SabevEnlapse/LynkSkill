"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Search, Users, FileText, Clock, Layers, Building2, Calendar, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"

type ApiProject = {
    id: string
    internship: {
        title: string
        company: { name: string }
        startDate: string
        endDate: string
    }
    student: { name: string; email: string }
    status: "ONGOING" | "COMPLETED"
    createdAt: string
}

export function AssignmentsTabContent() {
    const [projects, setProjects] = useState<ApiProject[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [selected, setSelected] = useState<ApiProject | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [filter, setFilter] = useState<"all" | "recent">("all")

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/projects")
            const text = await res.text()
            try {
                const parsed = JSON.parse(text)
                console.log("Projects API raw payload:", parsed)
                if (!Array.isArray(parsed)) {
                    setError("Unexpected API response shape")
                    setProjects([])
                } else {
                    setProjects(parsed)
                }
            } catch (parseErr) {
                console.error("Failed to parse /api/projects response as JSON array:", parseErr, "raw:", text)
                setError("Invalid API response")
                setProjects([])
            }
        } catch (err: unknown) {
            console.error("Failed to fetch /api/projects", err)
            setError(err instanceof Error ? err.message : "Failed to fetch projects")
            setProjects([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    async function handleRefresh() {
        setRefreshing(true)
        await load()
        setRefreshing(false)
    }

    const filteredProjects = projects.filter(
        (project) =>
            project.internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.internship.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const now = Date.now()
    const finalProjects =
        filter === "recent"
            ? filteredProjects.filter((p) => {
                const createdAt = new Date(p.createdAt).getTime()
                const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24)
                return diffDays <= 5
            })
            : filteredProjects

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap gap-3 mb-6">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    className="rounded-2xl"
                    onClick={() => setFilter("all")}
                >
                    <Layers className="mr-2 h-4 w-4" />
                    All Assignments
                </Button>

                <Button
                    variant={filter === "recent" ? "default" : "outline"}
                    className="rounded-2xl"
                    onClick={() => setFilter("recent")}
                >
                    <Clock className="mr-2 h-4 w-4" />
                    Recent
                </Button>
                <div className="flex-1"></div>
                <div className="relative w-full md:w-auto mt-3 md:mt-0">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search assignments..."
                        className="w-full rounded-2xl pl-9 md:w-[250px] border-2 focus:border-[var(--projects-accent)] transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                    className="rounded-2xl"
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    {refreshing ? "Refreshing..." : "Refresh"}
                </Button>
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="rounded-3xl animate-pulse">
                            <CardHeader>
                                <div className="h-6 bg-muted rounded w-3/4"></div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="h-4 bg-muted rounded w-1/2"></div>
                                <div className="h-4 bg-muted rounded w-2/3"></div>
                                <div className="h-6 bg-muted rounded w-20"></div>
                                <div className="h-3 bg-muted rounded w-1/3"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <div className="text-destructive text-lg font-medium">Error: {error}</div>
                    <Button onClick={handleRefresh} className="mt-4 rounded-2xl">
                        Try Again
                    </Button>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                    {searchQuery ? (
                        <div>
                            <div className="text-muted-foreground text-lg">No projects match your search.</div>
                            <Button onClick={() => setSearchQuery("")} variant="outline" className="mt-4 rounded-2xl">
                                Clear Search
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <div className="text-muted-foreground text-lg">No projects yet.</div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Projects will appear here once applications are approved.
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">
                            {searchQuery
                                ? `Search Results (${filteredProjects.length})`
                                : `Active Assignments (${filteredProjects.length})`}
                        </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {finalProjects.map((proj) => (
                            <Card
                                key={proj.id}
                                className="group rounded-3xl cursor-pointer border-2 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden relative"
                                onClick={() => setSelected(proj)}
                                style={
                                    {
                                        background: `linear-gradient(135deg, var(--internship-card-gradient-from), var(--internship-card-gradient-to))`,
                                        borderColor: `var(--internship-card-border)`,
                                        boxShadow: `0 4px 12px var(--internship-card-shadow)`,
                                    } as React.CSSProperties
                                }
                            >
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        background: `linear-gradient(135deg, var(--internship-card-hover-from), var(--internship-card-hover-to))`,
                                    }}
                                />

                                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
                                <CardHeader className="relative z-10">
                                    <div className="flex items-start justify-between gap-2">
                                        <CardTitle className="line-clamp-2 text-lg group-hover:text-white transition-colors duration-300">
                                            {proj.internship.title}
                                        </CardTitle>
                                        <Badge
                                            variant={proj.status === "ONGOING" ? "secondary" : "default"}
                                            className="rounded-xl shrink-0 group-hover:scale-105 transition-transform group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30"
                                        >
                                            {proj.status}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3 relative z-10">
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm group-hover:text-white/90 transition-colors duration-300">
                                            <div
                                                className="w-2 h-2 rounded-full mr-2 group-hover:bg-white/80 transition-colors duration-300"
                                                style={{ backgroundColor: `var(--internship-card-hover-from)` }}
                                            ></div>
                                            <span className="font-medium">Company:</span>
                                            <span className="ml-1">{proj.internship.company?.name ?? "Unknown"}</span>
                                        </div>
                                        <div className="flex items-center text-sm group-hover:text-white/90 transition-colors duration-300">
                                            <Users className="w-4 h-4 mr-2 group-hover:text-white/70 transition-colors duration-300" />
                                            <span className="font-medium">Student:</span>
                                            <span className="ml-1 truncate">{proj.student?.name ?? proj.student?.email ?? "Unknown"}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t group-hover:border-white/20 transition-colors duration-300">
                                        <div className="flex items-center justify-between text-xs group-hover:text-white/80 transition-colors duration-300">
                                            <div className="flex items-center text-sm group-hover:text-white/90 transition-colors duration-300">
                                                <Clock className="w-4 h-4 mr-2 group-hover:text-white/70 transition-colors duration-300" />
                                                <span className="font-medium">Period:</span>
                                                <span className="ml-1">
                          {new Date(proj.internship.startDate).toLocaleDateString()} -{" "}
                                                    {new Date(proj.internship.endDate).toLocaleDateString()}
                        </span>
                                            </div>

                                            <div className="flex items-center">
                                                <FileText className="w-3 h-3 mr-1" />
                                                View Details
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>

                                <div
                                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                    style={{
                                        boxShadow: `0 20px 40px var(--internship-card-shadow-hover)`,
                                    }}
                                />
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                <DialogContent className="rounded-3xl max-w-2xl border-2 bg-background">
                    <div
                        className="absolute top-0 left-0 right-0 h-32 rounded-t-3xl opacity-20"
                        style={{
                            background: `linear-gradient(135deg, var(--projects-card-hover-from), var(--projects-card-hover-to))`,
                        }}
                    />

                    <DialogHeader className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className="p-3 rounded-xl"
                                style={{
                                    background: `linear-gradient(135deg, var(--projects-card-hover-from), var(--projects-card-hover-to))`,
                                }}
                            >
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold">Assignment Details</DialogTitle>
                                <p className="text-sm text-muted-foreground">Complete project information</p>
                            </div>
                        </div>
                    </DialogHeader>

                    {selected && (
                        <div className="space-y-6 relative z-10">
                            <div
                                className="p-6 rounded-2xl border-2 relative overflow-hidden"
                                style={{
                                    background: `linear-gradient(135deg, var(--projects-card-hover-from)/10, var(--projects-card-hover-to)/10)`,
                                    borderColor: `var(--projects-accent)/30`,
                                }}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl" />
                                <div className="relative">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                                                Internship Position
                                            </div>
                                            <h3 className="text-xl font-bold text-balance mb-2">{selected.internship.title}</h3>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{selected.internship.company?.name ?? "Unknown"}</span>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={selected.status === "ONGOING" ? "secondary" : "default"}
                                            className="rounded-xl px-3 py-1 text-sm font-semibold"
                                        >
                                            {selected.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="h-4 w-4" style={{ color: "var(--projects-accent)" }} />
                                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</div>
                                    </div>
                                    <div className="font-semibold text-lg">
                                        {selected.student?.name ?? selected.student?.email ?? "Unknown"}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">{selected.student.email}</div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="h-4 w-4" style={{ color: "var(--projects-accent)" }} />
                                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</div>
                                    </div>
                                    <div className="font-semibold text-sm">
                                        {new Date(selected.internship.startDate).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </div>
                                    <div className="text-xs text-muted-foreground my-1">to</div>
                                    <div className="font-semibold text-sm">
                                        {new Date(selected.internship.endDate).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="h-4 w-4" style={{ color: "var(--projects-accent)" }} />
                                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Started On</div>
                                    </div>
                                    <div className="font-semibold">
                                        {new Date(selected.createdAt).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {new Date(selected.createdAt).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="h-4 w-4" style={{ color: "var(--projects-accent)" }} />
                                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</div>
                                    </div>
                                    <div className="font-semibold text-2xl">
                                        {(() => {
                                            const start = new Date(selected.internship.startDate).getTime()
                                            const end = new Date(selected.internship.endDate).getTime()
                                            const now = Date.now()
                                            const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
                                            return Math.round(progress)
                                        })()}%
                                    </div>
                                    <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${(() => {
                                                    const start = new Date(selected.internship.startDate).getTime()
                                                    const end = new Date(selected.internship.endDate).getTime()
                                                    const now = Date.now()
                                                    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
                                                })()}%`,
                                                background: `linear-gradient(90deg, var(--projects-card-hover-from), var(--projects-card-hover-to))`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="relative z-10">
                        <Button
                            onClick={() => setSelected(null)}
                            className="rounded-2xl px-6 text-foreground"
                            style={{
                                background: `linear-gradient(135deg, var(--projects-card-hover-from), var(--projects-card-hover-to))`,
                            }}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

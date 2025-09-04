"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import {Internship} from "@/app/types";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CardSkeleton } from "@/components/card-skeleton"

interface RecentAppsSectionProps {
    userType: "Student" | "Company"
    internships?: Internship[]
}

export function RecentAppsSection({ userType, internships = [] }: RecentAppsSectionProps) {
    const [isLoading, setIsLoading] = useState(true)
    const sectionTitle = userType === "Company" ? "My Recent Internship" : "Recent Apps"

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 2000)
        return () => clearTimeout(timer)
    }, [])

    const items = internships

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{sectionTitle}</h2>
                <Button variant="ghost" className="rounded-2xl">
                    View All
                </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                    : items.map((item: Internship) => (
                        <motion.div key={item.id} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                            <Card className="overflow-hidden rounded-3xl border-2 hover:border-primary/50 transition-all duration-300">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                                            {userType === "Company" ? "🏢" : "📌"}
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-2xl">
                                            <Star className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <CardTitle className="text-lg">{item.title}</CardTitle>
                                    <CardDescription>{item.description}</CardDescription>
                                    {userType === "Company" && (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                            📍 {item.location} {item.paid && `• 💰 ${item.salary || "Negotiable"}`}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button variant="secondary" className="w-full rounded-2xl">
                                        {userType === "Company" ? "Manage" : "Open"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
            </div>
        </section>
    )
}


"use client"

import {motion} from "framer-motion"
import {useEffect, useState} from "react"
import {Star} from "lucide-react"
import {Internship} from "@/app/types"
import {Button} from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {CardSkeleton} from "@/components/card-skeleton"
import {InternshipDetailsModal} from "@/components/internship-details-modal"

interface RecentAppsSectionProps {
    userType: "Student" | "Company"
    internships?: Internship[]
}

export function RecentAppsSection({userType, internships = []}: RecentAppsSectionProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [internshipList, setInternshipList] = useState<Internship[]>(internships)
    const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)

    const sectionTitle = userType === "Company" ? "My Recent Internship" : "Recent Apps"

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 2000)
        return () => clearTimeout(timer)
    }, [])

    const items = internshipList

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
                    ? Array.from({length: 3}).map((_, i) => <CardSkeleton key={i}/>)
                    : items.map((item: Internship) => (
                        <motion.div
                            key={item.id}
                            whileHover={{scale: 1.02, y: -5}}
                            whileTap={{scale: 0.98}}
                        >
                            <Card
                                className="flex flex-col overflow-hidden rounded-3xl border-2 hover:border-primary/50 transition-all duration-300 h-full">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                                            {userType === "Company" ? "🏢" : "📌"}
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-2xl">
                                            <Star className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1 flex flex-col w-full gap-2 break-words">
                                    <CardTitle className="text-lg">{item.title}</CardTitle>
                                    <CardDescription className="text-sm text-muted-foreground">
                                        {item.description}
                                    </CardDescription>

                                    {/* Always show location, qualifications, salary */}
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        📍 {item.location}
                                        {item.qualifications && ` • 🎓 ${item.qualifications}`}
                                        {item.paid && ` • 💰 ${item.salary ?? "Negotiable"}`}
                                    </div>
                                </CardContent>

                                <CardFooter>
                                    <Button
                                        variant="secondary"
                                        className="w-full rounded-2xl"
                                        onClick={() => setSelectedInternship(item)}
                                    >
                                        {userType === "Company" ? "Manage" : "Open"}
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Modal */}
                            <InternshipDetailsModal
                                open={!!selectedInternship && selectedInternship.id === item.id}
                                onClose={() => setSelectedInternship(null)}
                                internship={selectedInternship}
                                userType={userType}
                                onUpdate={(updated: Internship) =>
                                    setInternshipList((prev: Internship[]) =>
                                        prev.map((i: Internship) => (i.id === updated.id ? updated : i))
                                    )
                                }
                            />
                        </motion.div>
                    ))}
            </div>
        </section>
    )
}

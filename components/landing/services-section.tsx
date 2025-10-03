"use client"

import { motion } from "framer-motion"
import { Briefcase, FileText, Trophy } from "lucide-react"
import { ServiceCard } from "./service-card"

export function ServicesSection() {
    return (
        <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-20 md:space-y-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center space-y-4 mb-12 md:mb-20"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
                        Meet{" "}
                        <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Linky</span>
                    </h2>
                    <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                        Your friendly guide to all the amazing features LynkSkill has to offer
                    </p>
                </motion.div>

                <ServiceCard
                    icon={<Briefcase className="w-8 h-8 md:w-12 md:h-12" />}
                    title="Internship Management"
                    description="Streamline your internship journey from application to completion. Connect with top companies, track your progress, and manage all your opportunities in one centralized hub."
                    features={[
                        "Browse curated internship opportunities",
                        "One-click application process",
                        "Real-time status tracking",
                        "Direct communication with employers",
                    ]}
                    linkyPosition="right"
                    gradient="from-purple-600 to-blue-600"
                />

                <ServiceCard
                    icon={<FileText className="w-8 h-8 md:w-12 md:h-12" />}
                    title="Dynamic Portfolio Builder"
                    description="Create stunning portfolios that showcase your skills, projects, and achievements. Our intelligent filtering system helps employers find exactly what they're looking for."
                    features={[
                        "Customizable portfolio templates",
                        "Smart skill categorization",
                        "Project showcase with media support",
                        "SEO-optimized for maximum visibility",
                    ]}
                    linkyPosition="left"
                    gradient="from-blue-600 to-cyan-600"
                />

                <ServiceCard
                    icon={<Trophy className="w-8 h-8 md:w-12 md:h-12" />}
                    title="My Experience Hub"
                    description="Celebrate your wins and share your journey! Post achievements, milestones, and experiences to inspire others and build your professional narrative."
                    features={[
                        "Share achievements and milestones",
                        "Build your professional story",
                        "Connect with like-minded peers",
                        "Gain recognition from employers",
                    ]}
                    linkyPosition="right"
                    gradient="from-cyan-600 to-purple-600"
                />
            </div>
        </section>
    )
}

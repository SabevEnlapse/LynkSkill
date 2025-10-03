"use client"

import { motion } from "framer-motion"
import { Users, Briefcase, FileText, Trophy } from "lucide-react"

const stats = [
    { value: "10,000+", label: "Active Students", icon: <Users className="w-6 h-6 md:w-8 md:h-8" /> },
    { value: "500+", label: "Partner Companies", icon: <Briefcase className="w-6 h-6 md:w-8 md:h-8" /> },
    { value: "15,000+", label: "Internships Posted", icon: <FileText className="w-6 h-6 md:w-8 md:h-8" /> },
    { value: "95%", label: "Success Rate", icon: <Trophy className="w-6 h-6 md:w-8 md:h-8" /> },
]

export function StatsSection() {
    return (
        <section className="relative py-16 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center space-y-4 md:space-y-6 mb-12 md:mb-20"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
                        Trusted by{" "}
                        <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Thousands
            </span>
                    </h2>
                    <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
                        Join a thriving community of students and businesses building the future together.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="relative p-6 md:p-8 rounded-3xl bg-card border-2 border-border hover:border-purple-500/50 transition-all duration-300 text-center space-y-3 md:space-y-4 group hover:shadow-2xl hover:shadow-purple-500/10"
                        >
                            <div className="inline-flex p-3 md:p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                {stat.icon}
                            </div>
                            <div className="space-y-1 md:space-y-2">
                                <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                    {stat.value}
                                </div>
                                <div className="text-sm md:text-lg text-muted-foreground font-medium">{stat.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

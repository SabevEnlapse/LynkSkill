"use client"

import { motion } from "framer-motion"
import { Target, Zap, Shield, TrendingUp } from "lucide-react"

const features = [
    {
        icon: <Target className="w-6 h-6 md:w-8 md:h-8" />,
        title: "Smart Matching",
        description:
            "AI-powered algorithm connects you with the perfect internship opportunities based on your skills and interests.",
        gradient: "from-purple-600 to-blue-600",
    },
    {
        icon: <Zap className="w-6 h-6 md:w-8 md:h-8" />,
        title: "Instant Applications",
        description: "Apply to multiple positions with one click. Your portfolio and credentials are always ready to go.",
        gradient: "from-blue-600 to-cyan-600",
    },
    {
        icon: <Shield className="w-6 h-6 md:w-8 md:h-8" />,
        title: "Verified Companies",
        description: "All partner companies are thoroughly vetted to ensure legitimate opportunities and safe experiences.",
        gradient: "from-cyan-600 to-purple-600",
    },
    {
        icon: <TrendingUp className="w-6 h-6 md:w-8 md:h-8" />,
        title: "Career Growth",
        description:
            "Track your progress, gain insights, and watch your professional journey unfold with detailed analytics.",
        gradient: "from-purple-600 to-pink-600",
    },
]

export function FeaturesOverview() {
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
                        Why Choose{" "}
                        <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              LynkSkill
            </span>
                        ?
                    </h2>
                    <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
                        We've built the most comprehensive platform for student-business connections, packed with features designed
                        to accelerate your career.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="group relative p-6 md:p-8 rounded-3xl bg-card border-2 border-border hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20"
                        >
                            <div
                                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                            />

                            <div className="relative space-y-3 md:space-y-4">
                                <div
                                    className={`inline-flex p-3 md:p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
                                >
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold">{feature.title}</h3>
                                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

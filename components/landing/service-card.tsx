"use client"

import type React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { CheckCircle2 } from "lucide-react"

interface ServiceCardProps {
    icon: React.ReactNode
    title: string
    description: string
    features: string[]
    linkyPosition: "left" | "right"
    gradient: string
}

export function ServiceCard({ icon, title, description, features, linkyPosition, gradient }: ServiceCardProps) {
    return (
        <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center ${linkyPosition === "left" ? "" : ""}`}
        >
            <motion.div
                className={`relative ${linkyPosition === "left" ? "lg:order-1" : "lg:order-2"} overflow-hidden`}
                initial={{ opacity: 0, x: linkyPosition === "right" ? 200 : -200 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1, ease: "easeOut" }}
            >
                <div className="relative w-full max-w-sm md:max-w-md mx-auto">
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    >
                        <Image
                            src="/linky-mascot.png"
                            alt="Linky mascot"
                            width={400}
                            height={400}
                            className="w-full h-auto drop-shadow-2xl"
                            priority
                        />
                    </motion.div>
                </div>
            </motion.div>

            {/* Content */}
            <motion.div
                className={`space-y-4 md:space-y-6 ${linkyPosition === "left" ? "lg:order-2" : "lg:order-1"}`}
                initial={{ opacity: 0, x: linkyPosition === "right" ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
            >
                <motion.div
                    className={`inline-flex p-3 md:p-4 rounded-2xl bg-gradient-to-r ${gradient}`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="text-white">{icon}</div>
                </motion.div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">{title}</h3>

                <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-pretty">{description}</p>

                <ul className="space-y-3">
                    {features.map((feature, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                            className="flex items-start gap-3"
                        >
                            <CheckCircle2 className={`mt-0.5 w-5 h-5 flex-shrink-0 text-purple-500`} />
                            <span className="text-sm md:text-base text-foreground">{feature}</span>
                        </motion.li>
                    ))}
                </ul>
            </motion.div>
        </div>
    )
}

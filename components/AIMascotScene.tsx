"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface AIMascotSceneProps {
    aiReply?: string
    portfolio?: unknown
    onClose: () => void
}


export default function AIMascotScene({ aiReply, onClose }: AIMascotSceneProps) {
    const [visible, setVisible] = useState(true)

    const handleClose = () => {
        setVisible(false)
        setTimeout(onClose, 400)
    }

    // Lock scroll only while open
    useEffect(() => {
        document.body.style.overflow = visible ? "hidden" : "auto"
        return () => {
            document.body.style.overflow = "auto"
        }
    }, [visible])

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Right-side panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{
                            type: "spring",
                            stiffness: 70,
                            damping: 20,
                        }}
                        className="relative h-full w-full md:w-[65%] bg-gradient-to-br from-purple-600 to-blue-700 text-white p-10 overflow-y-auto shadow-2xl rounded-l-3xl"
                    >
                        {/* Close Button */}
                        <div className="absolute top-6 right-6">
                            <Button
                                onClick={handleClose}
                                className="bg-white text-purple-700 hover:bg-gray-100 font-semibold rounded-2xl"
                            >
                                ✕ Close
                            </Button>
                        </div>

                        {/* Mascot */}
                        <motion.div
                            className="flex flex-col items-center mt-12"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                className="relative w-[180px] h-[180px] md:w-[220px] md:h-[220px]"
                            >
                                <Image
                                    src="/linky-mascot.png"
                                    alt="Linky mascot"
                                    fill
                                    className="object-contain drop-shadow-2xl"
                                    priority
                                />
                            </motion.div>

                            {/* AI Reply Text */}
                            <motion.div
                                className="bg-white/15 backdrop-blur-sm p-8 rounded-3xl shadow-lg mt-10 max-w-2xl w-full"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                <h2 className="text-2xl font-bold mb-4 text-center">
                                    💬 Linky’s Recommendation
                                </h2>
                                <p className="text-white/90 leading-relaxed whitespace-pre-line text-lg">
                                    {aiReply}
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

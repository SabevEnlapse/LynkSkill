"use client"

import { useState } from "react"
import AIMascotScene from "./AIMascotScene"

interface AIAssistantProps {
    portfolio: unknown
}

export default function AIAssistant({ portfolio }: AIAssistantProps) {
    const [reply, setReply] = useState("")
    const [loading, setLoading] = useState(false)
    const [showMascot, setShowMascot] = useState(false)

    const handleSend = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: `Give constructive portfolio improvement tips for this student: ${JSON.stringify(
                        portfolio,
                        null,
                        2
                    )}`,
                }),
            })

            const data = await res.json()
            if (data.reply) {
                setReply(data.reply)
            } else {
                setReply("No valid response received from AI.")
            }
            setShowMascot(true)
        } catch (err) {
            console.error("AI error:", err)
            setReply("Something went wrong while getting recommendations.")
            setShowMascot(true)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 border rounded-xl max-w-xl mx-auto mt-10 text-center">
            <h2 className="text-xl font-semibold mb-4">AI Portfolio Assistant</h2>
            <button
                onClick={handleSend}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-2xl font-semibold disabled:opacity-50 transition-all hover:scale-105"
                disabled={loading}
            >
                {loading ? "Thinking..." : "💡 Get Linky’s Recommendation"}
            </button>

            {/* Show the mascot overlay */}
            {showMascot && (
                <AIMascotScene
                    aiReply={reply || "Thinking..."}
                    onClose={() => setShowMascot(false)}
                />
            )}
        </div>
    )
}

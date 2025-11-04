"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ApplyButtonProps {
    internshipId: string
    onApplied?: () => void
    goToPortfolioTab?: () => void // 👈 Add this
}

export default function ApplyButton({ internshipId, onApplied, goToPortfolioTab }: ApplyButtonProps) {
    const [isApplying, setIsApplying] = useState(false)
    const [showIncompleteModal, setShowIncompleteModal] = useState(false)
    const router = useRouter()

    const handleApply = async () => {
        setIsApplying(true)

        try {
            // Check if portfolio has at least one field completed
            const portfolioRes = await fetch("/api/portfolio")
            if (portfolioRes.ok) {
                const portfolio = await portfolioRes.json()

                // Check if at least one meaningful field is filled
                const hasContent =
                    portfolio.bio ||
                    portfolio.headline ||
                    (portfolio.skills && portfolio.skills.length > 0) ||
                    (portfolio.interests && portfolio.interests.length > 0) ||
                    (portfolio.education && portfolio.education.length > 0) ||
                    (portfolio.projects && portfolio.projects.length > 0) ||
                    (portfolio.certifications && portfolio.certifications.length > 0) ||
                    portfolio.linkedin ||
                    portfolio.github ||
                    portfolio.portfolioUrl

                if (!hasContent) {
                    setShowIncompleteModal(true)
                    setIsApplying(false)
                    return
                }
            }

            // Proceed with application
            const res = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ internshipId }),
            })

            if (res.ok) {
                onApplied?.()
            } else {
                const data = await res.json()
                alert(data.error || "Failed to apply")
            }
        } catch (err) {
            console.error(err)
            alert("An error occurred while applying")
        } finally {
            setIsApplying(false)
        }
    }

    return (
        <>
            <Button
                onClick={handleApply}
                disabled={isApplying}
                size="lg"
                className="flex-1 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
                {isApplying ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Applying...
                    </>
                ) : (
                    <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Apply Now
                    </>
                )}
            </Button>

            <Dialog open={showIncompleteModal} onOpenChange={setShowIncompleteModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <DialogTitle className="text-xl">Complete Your Portfolio First</DialogTitle>
                        </div>
                        <DialogDescription className="text-base leading-relaxed pt-2">
                            Before applying to internships, you need to add at least some information to your portfolio. This helps
                            companies learn more about you and increases your chances of getting accepted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:gap-2">
                        <Button variant="outline" onClick={() => setShowIncompleteModal(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setShowIncompleteModal(false)
                                goToPortfolioTab?.() // 👈 Call the function if provided
                            }}
                            className="rounded-xl bg-gradient-to-r text-foreground from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                        >
                            Go to Portfolio
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

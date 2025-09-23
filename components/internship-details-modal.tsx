"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { Internship } from "@/app/types"
import { Briefcase, MapPin, GraduationCap, DollarSign, FileText, Building2, Loader2 } from "lucide-react"

interface InternshipDetailsModalProps {
    open: boolean
    onClose: () => void
    internship: Internship | null
    userType: "Student" | "Company"
    onUpdate: (updated: Internship) => void
}

interface Errors {
    title?: string[]
    description?: string[]
    location?: string[]
    qualifications?: string[]
    paid?: string[]
    salary?: string[]
}

export function InternshipDetailsModal({ open, onClose, internship, userType, onUpdate }: InternshipDetailsModalProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [location, setLocation] = useState("")
    const [qualifications, setQualifications] = useState("")
    const [paid, setPaid] = useState(false)
    const [salary, setSalary] = useState("")
    const [errors, setErrors] = useState<Errors>({})
    const [isSaving, setIsSaving] = useState(false)

    // Populate form when internship changes
    useEffect(() => {
        if (internship) {
            setTitle(internship.title)
            setDescription(internship.description)
            setLocation(internship.location)
            setQualifications(internship.qualifications || "")
            setPaid(internship.paid)
            setSalary(internship.salary?.toString() || "")
            setErrors({})
        }
    }, [internship])

    async function handleSave() {
        if (!internship) return
        setErrors({})

        // Validation
        const newErrors: Errors = {}
        if (!title) newErrors.title = ["Title is required"]
        if (!description) newErrors.description = ["Description is required"]
        if (!location) newErrors.location = ["Location is required"]
        if (paid && !salary) newErrors.salary = ["Salary is required for paid internships"]

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setIsSaving(true)

        try {
            const res = await fetch("/api/internships", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: internship.id,
                    title,
                    description,
                    location,
                    qualifications: qualifications || null,
                    paid,
                    salary: paid && salary ? Number.parseFloat(salary) : null,
                }),
            })

            if (!res.ok) throw new Error("Failed to update internship")

            const updated: Internship = await res.json()
            onUpdate(updated)
            onClose()
        } catch (err) {
            console.error(err)
            alert("Error updating internship")
        } finally {
            setIsSaving(false)
        }
    }

    if (!internship) return null

    return (
        <AnimatePresence>
            {open && (
                <Dialog open={open} onOpenChange={onClose}>
                    <DialogContent className="rounded-3xl max-w-2xl max-h-[90vh] overflow-hidden p-0 border-0 bg-transparent">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50"
                        >
                            <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-r from-[var(--internship-modal-gradient-from)] to-[var(--internship-modal-gradient-to)] p-8">
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                                        <Building2 className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-bold text-white mb-1">
                                            {userType === "Company" ? "Manage Internship" : "Internship Details"}
                                        </DialogTitle>
                                        <p className="text-white/80 text-sm">
                                            {userType === "Company" ? "Edit your internship details" : "View internship information"}
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />
                            </div>

                            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="grid gap-6"
                                >
                                    {/* Title Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-5 w-5 text-[var(--internship-modal-gradient-from)]" />
                                            <Label className="text-base font-semibold">Position Title</Label>
                                        </div>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            readOnly={userType === "Student"}
                                            className="rounded-xl border-2 focus:border-[var(--internship-modal-gradient-from)] transition-colors duration-200 py-3"
                                            placeholder="Enter internship title"
                                        />
                                        {errors.title && (
                                            <motion.p
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="text-sm text-red-500 flex items-center gap-1"
                                            >
                                                ⚠️ {errors.title[0]}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Description Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-[var(--internship-modal-gradient-from)]" />
                                            <Label className="text-base font-semibold">Description</Label>
                                        </div>
                                        <Textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            readOnly={userType === "Student"}
                                            className="rounded-xl border-2 focus:border-[var(--internship-modal-gradient-from)] transition-colors duration-200 min-h-[120px] resize-none"
                                            placeholder="Describe the internship role and responsibilities"
                                        />
                                        {errors.description && (
                                            <motion.p
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="text-sm text-red-500 flex items-center gap-1"
                                            >
                                                ⚠️ {errors.description[0]}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Location and Qualifications Grid */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-[var(--internship-modal-gradient-from)]" />
                                                <Label className="text-base font-semibold">Location</Label>
                                            </div>
                                            <Input
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                readOnly={userType === "Student"}
                                                className="rounded-xl border-2 focus:border-[var(--internship-modal-gradient-from)] transition-colors duration-200 py-3"
                                                placeholder="e.g., San Francisco, CA"
                                            />
                                            {errors.location && (
                                                <motion.p
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="text-sm text-red-500 flex items-center gap-1"
                                                >
                                                    ⚠️ {errors.location[0]}
                                                </motion.p>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-5 w-5 text-[var(--internship-modal-gradient-from)]" />
                                                <Label className="text-base font-semibold">Qualifications</Label>
                                            </div>
                                            <Input
                                                value={qualifications}
                                                onChange={(e) => setQualifications(e.target.value)}
                                                readOnly={userType === "Student"}
                                                className="rounded-xl border-2 focus:border-[var(--internship-modal-gradient-from)] transition-colors duration-200 py-3"
                                                placeholder="e.g., Computer Science major"
                                            />
                                            {errors.qualifications && (
                                                <motion.p
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="text-sm text-red-500 flex items-center gap-1"
                                                >
                                                    ⚠️ {errors.qualifications[0]}
                                                </motion.p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Compensation Section */}
                                    <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-r from-[var(--internship-form-background)] to-[var(--internship-form-background)]/50 border border-border/50">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-[var(--internship-modal-gradient-from)]" />
                                            <Label className="text-base font-semibold">Compensation</Label>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                checked={paid}
                                                onCheckedChange={(val) => setPaid(!!val)}
                                                disabled={userType === "Student"}
                                                className="rounded-lg border-2"
                                            />
                                            <Label className="text-sm font-medium">This is a paid internship</Label>
                                        </div>

                                        <AnimatePresence>
                                            {paid && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="space-y-2"
                                                >
                                                    <Label className="text-sm">Salary (per month)</Label>
                                                    <Input
                                                        type="number"
                                                        value={salary}
                                                        onChange={(e) => setSalary(e.target.value)}
                                                        readOnly={userType === "Student"}
                                                        className="rounded-xl border-2 focus:border-[var(--internship-modal-gradient-from)] transition-colors duration-200 py-3"
                                                        placeholder="e.g., 3000"
                                                    />
                                                    {errors.salary && (
                                                        <motion.p
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="text-sm text-red-500 flex items-center gap-1"
                                                        >
                                                            ��️ {errors.salary[0]}
                                                        </motion.p>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            </div>

                            <DialogFooter className="p-8 pt-0 flex flex-row gap-4 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isSaving}
                                    className="rounded-xl px-6 py-3 font-semibold border-2 hover:bg-muted/50 transition-all duration-200 bg-transparent"
                                >
                                    Close
                                </Button>
                                {userType === "Company" && (
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="rounded-xl px-8 py-3 font-semibold bg-gradient-to-r from-[var(--internship-modal-gradient-from)] to-[var(--internship-modal-gradient-to)] hover:shadow-lg transition-all duration-300 min-w-[120px]"
                                    >
                                        {isSaving ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Saving...
                                            </div>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </Button>
                                )}
                            </DialogFooter>
                        </motion.div>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    )
}

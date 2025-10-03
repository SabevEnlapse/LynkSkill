"use client"

import type React from "react"

import { useRef, useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { Internship } from "@/app/types"
import {
    Briefcase,
    MapPin,
    GraduationCap,
    DollarSign,
    FileText,
    Building2,
    Loader2,
    AlertCircle,
    CalendarIcon,
} from "lucide-react"
import { format } from "date-fns"

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
    applicationStart?: string[]
    applicationEnd?: string[]
}

export function InternshipDetailsModal({ open, onClose, internship, userType, onUpdate }: InternshipDetailsModalProps) {
    const titleRef = useRef<HTMLInputElement | null>(null)
    const descriptionRef = useRef<HTMLTextAreaElement | null>(null)
    const locationRef = useRef<HTMLInputElement | null>(null)
    const qualificationsRef = useRef<HTMLInputElement | null>(null)
    const salaryRef = useRef<HTMLInputElement | null>(null)

    const [applicationStart, setApplicationStart] = useState<Date | undefined>(undefined)
    const [applicationEnd, setApplicationEnd] = useState<Date | undefined>(undefined)

    const [paid, setPaid] = useState(false)
    const [errors, setErrors] = useState<Errors>({})
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (internship) {
            if (titleRef.current) titleRef.current.value = internship.title
            if (descriptionRef.current) descriptionRef.current.value = internship.description
            if (locationRef.current) locationRef.current.value = internship.location
            if (qualificationsRef.current) qualificationsRef.current.value = internship.qualifications || ""
            if (salaryRef.current) salaryRef.current.value = internship.salary?.toString() || ""
            setPaid(internship.paid)

            setApplicationStart(internship.applicationStart ? new Date(internship.applicationStart) : undefined)
            setApplicationEnd(internship.applicationEnd ? new Date(internship.applicationEnd) : undefined)

            setErrors({})
        }
    }, [internship])

    const readValues = useCallback(() => {
        return {
            title: titleRef.current?.value ?? "",
            description: descriptionRef.current?.value ?? "",
            location: locationRef.current?.value ?? "",
            qualifications: qualificationsRef.current?.value ?? "",
            paid,
            salary: salaryRef.current?.value ?? "",
            applicationStart: applicationStart?.toISOString().split("T")[0] ?? "",
            applicationEnd: applicationEnd?.toISOString().split("T")[0] ?? "",
        }
    }, [paid, applicationStart, applicationEnd])

    async function handleSave() {
        if (!internship) return

        const vals = readValues()

        const newErrors: Errors = {}
        if (!vals.title || vals.title.length < 3) {
            newErrors.title = ["Title must be at least 3 characters"]
        }
        if (!vals.description || vals.description.length < 10) {
            newErrors.description = ["Description must be at least 10 characters"]
        }
        if (!vals.applicationStart) {
            newErrors.applicationStart = ["Start date is required"]
        }
        if (!vals.applicationEnd) {
            newErrors.applicationEnd = ["End date is required"]
        }
        if (
            vals.applicationStart &&
            vals.applicationEnd &&
            new Date(vals.applicationStart) > new Date(vals.applicationEnd)
        ) {
            newErrors.applicationEnd = ["End date must be after start date"]
        }
        if (!vals.location || vals.location.length < 2) {
            newErrors.location = ["Location must be at least 2 characters"]
        }
        if (vals.paid && (!vals.salary || Number.parseFloat(vals.salary) <= 0)) {
            newErrors.salary = ["Salary is required and must be positive for paid internships"]
        }

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
                    title: vals.title,
                    description: vals.description,
                    location: vals.location,
                    qualifications: vals.qualifications || null,
                    paid: vals.paid,
                    salary: vals.paid && vals.salary ? Number.parseFloat(vals.salary) : null,
                    applicationStart: vals.applicationStart,
                    applicationEnd: vals.applicationEnd,
                }),
            })

            if (!res.ok) throw new Error("Failed to update internship")

            const updated: Internship = await res.json()
            setErrors({})
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
                    <DialogContent
                        className="rounded-2xl max-w-2xl max-h-[90vh] overflow-hidden p-0 border bg-slate-900 shadow-2xl"
                        style={{
                            borderColor: "color-mix(in oklch, var(--internship-modal-gradient-from) 20%, transparent)",
                            boxShadow:
                                "0 25px 50px -12px color-mix(in oklch, var(--internship-modal-gradient-from) 10%, transparent)",
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="bg-slate-900 rounded-2xl"
                        >
                            <div
                                className="relative overflow-hidden rounded-t-2xl p-8"
                                style={{
                                    background:
                                        "linear-gradient(135deg, var(--internship-modal-gradient-from), var(--internship-modal-gradient-to))",
                                }}
                            >
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                        <Building2 className="h-7 w-7 text-white" />
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
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
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
                                            <Briefcase className="h-5 w-5" style={{ color: "var(--internship-modal-gradient-from)" }} />
                                            <Label className="text-base font-semibold text-slate-200">Position Title</Label>
                                        </div>
                                        <Input
                                            ref={titleRef}
                                            readOnly={userType === "Student"}
                                            className="rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus:ring-2 transition-colors duration-200 py-3"
                                            placeholder="Enter internship title"
                                            style={
                                                {
                                                    "--tw-ring-color": "color-mix(in oklch, var(--internship-field-focus) 20%, transparent)",
                                                } as React.CSSProperties
                                            }
                                            onFocus={(e) => (e.target.style.borderColor = "var(--internship-field-focus)")}
                                            onBlur={(e) => (e.target.style.borderColor = "rgb(51 65 85)")}
                                        />
                                        {errors.title && (
                                            <motion.p
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="text-sm text-red-400 flex items-center gap-2"
                                            >
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.title[0]}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Description Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" style={{ color: "var(--internship-modal-gradient-from)" }} />
                                            <Label className="text-base font-semibold text-slate-200">Description</Label>
                                        </div>
                                        <Textarea
                                            ref={descriptionRef}
                                            defaultValue=""
                                            readOnly={userType === "Student"}
                                            className="rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus:ring-2 transition-colors duration-200 min-h-[120px] resize-none"
                                            placeholder="Describe the internship role and responsibilities"
                                            style={
                                                {
                                                    "--tw-ring-color": "color-mix(in oklch, var(--internship-field-focus) 20%, transparent)",
                                                } as React.CSSProperties
                                            }
                                            onFocus={(e) => (e.target.style.borderColor = "var(--internship-field-focus)")}
                                            onBlur={(e) => (e.target.style.borderColor = "rgb(51 65 85)")}
                                        />
                                        {errors.description && (
                                            <motion.p
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="text-sm text-red-400 flex items-center gap-2"
                                            >
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.description[0]}
                                            </motion.p>
                                        )}
                                    </div>
                                    {/* Application Period */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-5 w-5" style={{ color: "var(--internship-modal-gradient-from)" }} />
                                                <Label className="text-base font-semibold text-slate-200">Applications Open</Label>
                                            </div>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        disabled={userType === "Student"}
                                                        className="w-full justify-start text-left font-normal rounded-xl border border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800 py-6"
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {applicationStart ? (
                                                            format(applicationStart, "PPP")
                                                        ) : (
                                                            <span className="text-slate-500">Pick a date</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={applicationStart}
                                                        onSelect={setApplicationStart}
                                                        initialFocus
                                                        className="rounded-xl"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.applicationStart && (
                                                <motion.p
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="text-sm text-red-400 flex items-center gap-2"
                                                >
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.applicationStart[0]}
                                                </motion.p>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-5 w-5" style={{ color: "var(--internship-modal-gradient-from)" }} />
                                                <Label className="text-base font-semibold text-slate-200">Applications Close</Label>
                                            </div>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        disabled={userType === "Student"}
                                                        className="w-full justify-start text-left font-normal rounded-xl border border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800 py-6"
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {applicationEnd ? (
                                                            format(applicationEnd, "PPP")
                                                        ) : (
                                                            <span className="text-slate-500">Pick a date</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={applicationEnd}
                                                        onSelect={setApplicationEnd}
                                                        initialFocus
                                                        disabled={(date) => (applicationStart ? date < applicationStart : false)}
                                                        className="rounded-xl"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.applicationEnd && (
                                                <motion.p
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="text-sm text-red-400 flex items-center gap-2"
                                                >
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.applicationEnd[0]}
                                                </motion.p>
                                            )}
                                        </div>
                                    </div>
                                    {/* Location and Qualifications Grid */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-5 w-5" style={{ color: "var(--internship-modal-gradient-from)" }} />
                                                <Label className="text-base font-semibold text-slate-200">Location</Label>
                                            </div>
                                            <Input
                                                ref={locationRef}
                                                defaultValue=""
                                                readOnly={userType === "Student"}
                                                className="rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus:ring-2 transition-colors duration-200 py-3"
                                                placeholder="e.g., San Francisco, CA"
                                                style={
                                                    {
                                                        "--tw-ring-color": "color-mix(in oklch, var(--internship-field-focus) 20%, transparent)",
                                                    } as React.CSSProperties
                                                }
                                                onFocus={(e) => (e.target.style.borderColor = "var(--internship-field-focus)")}
                                                onBlur={(e) => (e.target.style.borderColor = "rgb(51 65 85)")}
                                            />
                                            {errors.location && (
                                                <motion.p
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="text-sm text-red-400 flex items-center gap-2"
                                                >
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.location[0]}
                                                </motion.p>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-5 w-5" style={{ color: "var(--internship-modal-gradient-from)" }} />
                                                <Label className="text-base font-semibold text-slate-200">Qualifications</Label>
                                            </div>
                                            <Input
                                                ref={qualificationsRef}
                                                defaultValue=""
                                                readOnly={userType === "Student"}
                                                className="rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus:ring-2 transition-colors duration-200 py-3"
                                                placeholder="e.g., Computer Science major"
                                                style={
                                                    {
                                                        "--tw-ring-color": "color-mix(in oklch, var(--internship-field-focus) 20%, transparent)",
                                                    } as React.CSSProperties
                                                }
                                                onFocus={(e) => (e.target.style.borderColor = "var(--internship-field-focus)")}
                                                onBlur={(e) => (e.target.style.borderColor = "rgb(51 65 85)")}
                                            />
                                        </div>
                                    </div>

                                    {/* Compensation Section */}
                                    <div className="space-y-4 p-6 rounded-xl bg-slate-800/50 border border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5" style={{ color: "var(--internship-modal-gradient-from)" }} />
                                            <Label className="text-base font-semibold text-slate-200">Compensation</Label>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                checked={paid}
                                                onCheckedChange={(val) => setPaid(!!val)}
                                                disabled={userType === "Student"}
                                                className="rounded-lg border-slate-600"
                                                style={
                                                    {
                                                        "--checkbox-checked-bg": "var(--internship-modal-gradient-from)",
                                                        "--checkbox-checked-border": "var(--internship-modal-gradient-from)",
                                                    } as React.CSSProperties
                                                }
                                            />
                                            <Label className="text-sm font-medium text-slate-300">This is a paid internship</Label>
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
                                                    <Label className="text-sm text-slate-300">Salary (per month)</Label>
                                                    <Input
                                                        ref={salaryRef}
                                                        defaultValue=""
                                                        type="number"
                                                        readOnly={userType === "Student"}
                                                        className="rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus:ring-2 transition-colors duration-200 py-3"
                                                        placeholder="e.g., 3000"
                                                        style={
                                                            {
                                                                "--tw-ring-color":
                                                                    "color-mix(in oklch, var(--internship-field-focus) 20%, transparent)",
                                                            } as React.CSSProperties
                                                        }
                                                        onFocus={(e) => (e.target.style.borderColor = "var(--internship-field-focus)")}
                                                        onBlur={(e) => (e.target.style.borderColor = "rgb(51 65 85)")}
                                                    />
                                                    {errors.salary && (
                                                        <motion.p
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="text-sm text-red-400 flex items-center gap-2"
                                                        >
                                                            <AlertCircle className="h-3 w-3" />
                                                            {errors.salary[0]}
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
                                    className="rounded-xl px-6 py-3 font-semibold border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 transition-all duration-200"
                                >
                                    Close
                                </Button>
                                {userType === "Company" && (
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="rounded-xl px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 min-w-[120px]"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, var(--internship-modal-gradient-from), var(--internship-modal-gradient-to))",
                                            boxShadow:
                                                "0 10px 25px -5px color-mix(in oklch, var(--internship-modal-gradient-from) 20%, transparent)",
                                        }}
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

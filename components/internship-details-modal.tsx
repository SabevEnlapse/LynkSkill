"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Internship } from "@/app/types"

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

export function InternshipDetailsModal({
                                           open,
                                           onClose,
                                           internship,
                                           userType,
                                           onUpdate,
                                       }: InternshipDetailsModalProps) {
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
                    salary: paid && salary ? parseFloat(salary) : null,
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
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="rounded-2xl max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {userType === "Company" ? "Manage Internship" : "Internship Details"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <Label>Title</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            readOnly={userType === "Student"}
                        />
                        {errors.title && <p className="text-sm text-red-500">{errors.title[0]}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <Label>Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            readOnly={userType === "Student"}
                            className="outline-none resize-none"
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description[0]}</p>}
                    </div>

                    {/* Location */}
                    <div>
                        <Label>Location</Label>
                        <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            readOnly={userType === "Student"}
                        />
                        {errors.location && <p className="text-sm text-red-500">{errors.location[0]}</p>}
                    </div>

                    {/* Qualifications */}
                    <div>
                        <Label>Qualifications</Label>
                        <Input
                            value={qualifications}
                            onChange={(e) => setQualifications(e.target.value)}
                            readOnly={userType === "Student"}
                        />
                        {errors.qualifications && <p className="text-sm text-red-500">{errors.qualifications[0]}</p>}
                    </div>

                    {/* Paid */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={paid}
                            onCheckedChange={(val) => setPaid(!!val)}
                            disabled={userType === "Student"}
                        />
                        <Label>Paid Internship</Label>
                        {errors.paid && <p className="text-sm text-red-500">{errors.paid[0]}</p>}
                    </div>

                    {/* Salary */}
                    {paid && (
                        <div>
                            <Label>Salary</Label>
                            <Input
                                type="number"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                readOnly={userType === "Student"}
                            />
                            {errors.salary && <p className="text-sm text-red-500">{errors.salary[0]}</p>}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex flex-col gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Close
                    </Button>
                    {userType === "Company" && (
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// components/internship-modal.tsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface InternshipModalProps {
    open: boolean
    onClose: () => void
    onCreate: (internship: any) => void
}

interface Errors {
    title?: string[]
    description?: string[]
    location?: string[]
    qualifications?: string[]
    paid?: string[]
    salary?: string[]
}

export function InternshipModal({ open, onClose, onCreate }: InternshipModalProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [location, setLocation] = useState("")
    const [qualifications, setQualifications] = useState("")
    const [paid, setPaid] = useState(false)
    const [salary, setSalary] = useState("")
    const [errors, setErrors] = useState<Errors>({})

    async function handleSubmit() {
        // reset errors
        setErrors({})

        // простa валидация на фронтенд
        const newErrors: Errors = {}
        if (!title) newErrors.title = ["Title is required"]
        if (!description) newErrors.description = ["Description is required"]
        if (!location) newErrors.location = ["Location is required"]
        if (paid && !salary) newErrors.salary = ["Salary is required for paid internships"]

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        // изпращане към бекенд
        const res = await fetch("/api/internships", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                description,
                location,
                qualifications: qualifications || null,
                paid,
                salary: paid && salary ? parseFloat(salary) : null,
            }),
        })

        if (res.ok) {
            const data = await res.json()
            onCreate(data)
            onClose()
            // reset form
            setTitle("")
            setDescription("")
            setLocation("")
            setQualifications("")
            setPaid(false)
            setSalary("")
            setErrors({})
        } else {
            const errData = await res.json()
            alert(errData.message || "Failed to create internship")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Create Internship</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                        {errors.title && <p className="text-sm text-red-500">{errors.title[0]}</p>}
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="outline-none resize-none"
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description[0]}</p>}
                    </div>

                    <div>
                        <Label>Location</Label>
                        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                        {errors.location && <p className="text-sm text-red-500">{errors.location[0]}</p>}
                    </div>

                    <div>
                        <Label>Qualifications (optional)</Label>
                        <Input value={qualifications} onChange={(e) => setQualifications(e.target.value)} />
                        {errors.qualifications && <p className="text-sm text-red-500">{errors.qualifications[0]}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox checked={paid} onCheckedChange={(val) => setPaid(!!val)} />
                        <Label>Paid Internship</Label>
                        {errors.paid && <p className="text-sm text-red-500">{errors.paid[0]}</p>}
                    </div>

                    {paid && (
                        <div>
                            <Label>Salary</Label>
                            <Input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} />
                            {errors.salary && <p className="text-sm text-red-500">{errors.salary[0]}</p>}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

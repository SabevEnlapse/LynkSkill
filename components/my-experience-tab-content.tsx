"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { useUser } from "@clerk/nextjs"
import {
  Upload,
  Building2,
  FileImage,
  FileVideo,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  Download,
  Sparkles,
  Users,
  RefreshCw,
  Search,
  Layers,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input" // Added Input import
import { StudentSummary } from "@/components/student-summary"

type Experience = {
  id: string
  status: string
  mediaUrls: string[]
  grade: number | null
  createdAt: string
  updatedAt: string
  student?: { id: string; email: string }
  company?: { id: string; name: string; logo: string | null }
}

type Company = { id: string; name: string; logo: string | null }

type Summary = {
  totalPoints: number
  avgGrade: number
  uniqueCompanies: number
  allRound: number
}

export default function ExperienceTabContent() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role as "STUDENT" | "COMPANY" | undefined

  const [experiences, setExperiences] = useState<Experience[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)
  const [companyId, setCompanyId] = useState<string>("")
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "recent">("all")

  const loadExperiences = useCallback(async () => {
    if (!role) return
    setLoading(true)
    try {
      const res = await fetch("/api/experience")
      if (!res.ok) throw new Error("Failed to load experiences")
      const data = await res.json()

      if (Array.isArray(data)) {
        setExperiences(data)
        setSummary(null)
      } else {
        setExperiences(Array.isArray(data.experiences) ? data.experiences : [])
        setSummary(data.summary || null)
      }
    } catch (err) {
      console.error(err)
      setExperiences([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [role])

  // ✅ Fetch experiences + summary
  useEffect(() => {
    loadExperiences()
  }, [loadExperiences])

  async function handleRefresh() {
    setRefreshing(true)
    await loadExperiences()
    setRefreshing(false)
  }

  // ✅ Fetch companies (only for students)
  useEffect(() => {
    if (role !== "STUDENT") return
    const fetchCompanies = async () => {
      try {
        const res = await fetch("/api/companies")
        if (!res.ok) throw new Error("Failed to load companies")
        const data = await res.json()
        setCompanies(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchCompanies()
  }, [role])

  // drag + file upload helpers …
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      setFiles(e.dataTransfer.files)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files)
    }
  }

  const removeFile = (index: number) => {
    if (files) {
      const dt = new DataTransfer()
      Array.from(files).forEach((file, i) => {
        if (i !== index) dt.items.add(file)
      })
      setFiles(dt.files.length > 0 ? dt.files : null)
    }
  }

  // ✅ Upload (student)
  const handleUpload = async () => {
    if (!files || !companyId) return alert("Please select company and files")
    setLoading(true)
    setUploadProgress(0)
    try {
      const formData = new FormData()
      formData.append("companyId", companyId)
      Array.from(files).forEach((file) => formData.append("files", file))

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const res = await fetch("/api/experience", { method: "POST", body: formData })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!res.ok) throw new Error("Upload failed")
      const newExp = await res.json()
      setExperiences((prev) => [newExp, ...prev])
      setFiles(null)
      setCompanyId("")
      setUploadProgress(0)
    } catch (err) {
      console.error(err)
      alert("Upload failed")
      setUploadProgress(0)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Approve/reject (company)
  const handleAction = async (id: string, action: "approve" | "reject", grade?: number | null) => {
    try {
      const res = await fetch(`/api/experience/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "approve" ? "approved" : "rejected",
          grade: action === "approve" ? (grade ?? null) : null, // <-- use provided grade
        }),
      })
      if (!res.ok) throw new Error("Action failed")
      const updated = await res.json()
      setExperiences((prev) => prev.map((exp) => (exp.id === updated.id ? updated : exp)))
    } catch (err) {
      console.error(err)
      alert("Action failed")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-[var(--experience-success)] text-white"
      case "pending":
        return "bg-[var(--experience-warning)] text-white"
      case "rejected":
        return "bg-[var(--experience-error)] text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getFileIcon = (url: string) =>
      url.match(/\.(mp4|mov|avi)$/i) ? <FileVideo className="h-4 w-4" /> : <FileImage className="h-4 w-4" />

  const filteredExperiences = experiences.filter((experience) => {
    const searchLower = searchQuery.toLowerCase()
    const companyName = experience.company?.name?.toLowerCase() || ""
    const studentEmail = experience.student?.email?.toLowerCase() || ""
    const status = experience.status.toLowerCase()

    return companyName.includes(searchLower) || studentEmail.includes(searchLower) || status.includes(searchLower)
  })

  const now = Date.now()
  const finalExperiences =
      filter === "recent"
          ? filteredExperiences.filter((exp) => {
            const createdAt = new Date(exp.createdAt).getTime()
            const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24)
            return diffDays <= 5
          })
          : filteredExperiences

  // ✅ Loading state
  if (!role) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--experience-accent)]/30 border-t-[var(--experience-accent)]" />
            <span className="text-muted-foreground">Loading...</span>
          </div>
        </div>
    )
  }

  return (
      <div className="space-y-8">
        {/* Hero Section */}
        <section>
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--experience-hero-gradient-from)] to-[var(--experience-hero-gradient-to)] p-8 text-white relative"
          >
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">
                  {role === "STUDENT" ? "Share Your Experience" : "Review Student Experiences"}
                </h2>
                <p className="max-w-[600px] text-white/90">
                  {role === "STUDENT"
                      ? "Upload and showcase your professional experiences, projects, and achievements with companies."
                      : "Review and evaluate student submissions, providing valuable feedback on their professional experiences."}
                </p>
                {/* Student summary only visible if role === "STUDENT" and summary exists */}
                {summary && role === "STUDENT" && <StudentSummary summary={summary} />}
              </div>
              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium">{experiences.length} Experiences</span>
                </div>
                {role === "COMPANY" && (
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span className="text-sm font-medium">
                    {experiences.filter((exp) => exp.status === "pending").length} Pending
                  </span>
                    </div>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        <div className="flex flex-wrap gap-3 mb-6">
          <Button
              variant={filter === "all" ? "default" : "outline"}
              className="rounded-2xl"
              onClick={() => setFilter("all")}
          >
            <Layers className="mr-2 h-4 w-4" />
            All Experiences
          </Button>

          <Button
              variant={filter === "recent" ? "default" : "outline"}
              className="rounded-2xl"
              onClick={() => setFilter("recent")}
          >
            <Clock className="mr-2 h-4 w-4" />
            Recent
          </Button>

          <div className="flex-1"></div>
          <div className="relative w-full md:w-auto mt-3 md:mt-0">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search experiences..."
                className="w-full rounded-2xl pl-9 md:w-[250px] border-2 focus:border-[var(--experience-accent)] transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="rounded-2xl"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {/* Upload Section - Students Only */}
        {role === "STUDENT" && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--experience-accent)] text-white text-sm font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">Upload Experience</h3>
              </div>

              <Card className="overflow-hidden rounded-3xl border-2 border-[var(--experience-step-border)] bg-[var(--experience-step-background)]">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[var(--experience-accent)]" />
                    Select Company & Upload Files
                  </CardTitle>
                  <CardDescription>
                    Choose the company and upload images, videos, or documents related to your experience.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Company Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company</label>
                    <select
                        value={companyId}
                        onChange={(e) => setCompanyId(e.target.value)}
                        className="w-full rounded-2xl border border-[var(--experience-step-border)] bg-background px-4 py-3 text-sm focus:border-[var(--experience-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--experience-accent)]/20 transition-all"
                    >
                      <option value="">Select a company...</option>
                      {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                      ))}
                    </select>
                  </div>

                  {/* File Upload Zone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Files</label>
                    <div
                        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                            dragActive
                                ? "border-[var(--experience-upload-zone-active)] bg-[var(--experience-upload-zone-active)]/10"
                                : "border-[var(--experience-step-border)] bg-[var(--experience-upload-zone)] hover:bg-[var(--experience-upload-zone-hover)]"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                      <input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept="image/*,video/*,.pdf,.doc,.docx"
                      />
                      <div className="space-y-3">
                        <div className="mx-auto w-12 h-12 rounded-full bg-[var(--experience-accent)]/10 flex items-center justify-center">
                          <Upload className="h-6 w-6 text-[var(--experience-accent)]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Drop files here or click to browse</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Support for images, videos, PDFs, and documents
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected Files */}
                  {files && files.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Selected Files ({files.length})</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {Array.from(files).map((file, index) => (
                              <div
                                  key={index}
                                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-[var(--experience-step-border)]"
                              >
                                <div className="flex items-center gap-3">
                                  {getFileIcon(file.name)}
                                  <div>
                                    <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                  </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeFile(index)}
                                    className="h-8 w-8 p-0 hover:bg-[var(--experience-error)]/10 hover:text-[var(--experience-error)]"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                          ))}
                        </div>
                      </div>
                  )}

                  {/* Upload Progress */}
                  {loading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                  )}

                  {/* Upload Button */}
                  <Button
                      onClick={handleUpload}
                      disabled={loading || !companyId || !files}
                      className="w-full rounded-2xl bg-[var(--experience-button-primary)] hover:bg-[var(--experience-button-primary-hover)] text-white py-3 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Uploading Experience...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Share Experience
                        </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </section>
        )}

        {/* Experiences List */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--experience-accent)] text-white text-sm font-bold">
              {role === "STUDENT" ? "2" : "1"}
            </div>
            <h3 className="text-xl font-semibold">{role === "STUDENT" ? "Your Experiences" : "Student Submissions"}</h3>
          </div>

          {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="rounded-3xl animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                        <div className="h-6 bg-muted rounded w-20"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                      </CardContent>
                    </Card>
                ))}
              </div>
          ) : finalExperiences.length === 0 ? (
              <Card className="rounded-3xl border-2 border-dashed border-[var(--experience-step-border)] p-12 text-center">
                <div className="space-y-3">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {searchQuery
                          ? "No experiences match your search"
                          : role === "STUDENT"
                              ? "No experiences yet"
                              : "No submissions yet"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? (
                          <>
                            Try adjusting your search terms or{" "}
                            <button onClick={() => setSearchQuery("")} className="text-primary underline">
                              clear search
                            </button>
                          </>
                      ) : role === "STUDENT" ? (
                          "Upload your first experience to get started"
                      ) : (
                          "Student submissions will appear here for review"
                      )}
                    </p>
                  </div>
                </div>
              </Card>
          ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">
                    {searchQuery
                        ? `Search Results (${finalExperiences.length})`
                        : `${filter === "recent" ? "Recent " : ""}Experiences (${finalExperiences.length})`}
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {finalExperiences.map((exp, index) => (
                      <motion.div
                          key={exp.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -5 }}
                          whileTap={{ scale: 0.98 }}
                      >
                        <Card className="overflow-hidden rounded-3xl border border-[var(--experience-card-shadow)] bg-gradient-to-br from-[var(--experience-card-gradient-from)] to-[var(--experience-card-gradient-to)] hover:shadow-lg hover:shadow-[var(--experience-card-shadow-hover)] transition-all duration-300 group">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-[var(--experience-accent)]/20">
                                  <AvatarFallback className="bg-[var(--experience-accent)]/10 text-[var(--experience-accent)] font-semibold">
                                    {role === "STUDENT"
                                        ? exp.company?.name?.charAt(0) || "?"
                                        : exp.student?.email?.charAt(0).toUpperCase() || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-base group-hover:text-[var(--experience-accent)] transition-colors">
                                    {role === "STUDENT"
                                        ? exp.company?.name || "Unknown Company"
                                        : exp.student?.email || "Unknown Student"}
                                  </CardTitle>
                                  <CardDescription className="text-xs">
                                    {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : "Recently"}
                                  </CardDescription>
                                </div>
                              </div>
                              <Badge className={`rounded-xl text-xs ${getStatusColor(exp.status)}`}>
                                {exp.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {exp.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                {exp.status === "rejected" && <AlertCircle className="h-3 w-3 mr-1" />}
                                {exp.status}
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            {/* Media Preview */}
                            {exp.mediaUrls.length > 0 && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Media Files</span>
                                    <Badge variant="outline" className="rounded-xl text-xs">
                                      {exp.mediaUrls.length} files
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {exp.mediaUrls.slice(0, 4).map((url, i) => (
                                        <div key={i} className="relative group/media">
                                          {url.endsWith(".mp4") || url.endsWith(".mov") ? (
                                              <div className="aspect-square rounded-xl bg-gradient-to-br from-[var(--experience-accent)]/20 to-[var(--experience-accent)]/10 flex items-center justify-center border border-[var(--experience-step-border)]">
                                                <FileVideo className="h-6 w-6 text-[var(--experience-accent)]" />
                                              </div>
                                          ) : (
                                              <img
                                                  src={url || "/placeholder.svg"}
                                                  alt={`Experience ${i + 1}`}
                                                  className="aspect-square w-full object-cover rounded-xl border border-[var(--experience-step-border)]"
                                              />
                                          )}
                                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/media:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                                            >
                                              <Download className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                    ))}
                                  </div>
                                  {exp.mediaUrls.length > 4 && (
                                      <p className="text-xs text-muted-foreground text-center">
                                        +{exp.mediaUrls.length - 4} more files
                                      </p>
                                  )}
                                </div>
                            )}
                            {/* Company Actions */}
                            {role === "COMPANY" && exp.status === "pending" && (
                                <div className="pt-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                          size="sm"
                                          className="w-full bg-[var(--experience-success)] hover:bg-[var(--experience-success)]/90 text-white rounded-2xl"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                    </DialogTrigger>

                                    <DialogContent className="sm:max-w-[500px] rounded-3xl border-2 border-[var(--experience-step-border)] bg-gradient-to-br from-[var(--experience-card-gradient-from)] to-[var(--experience-card-gradient-to)]">
                                      <DialogHeader className="space-y-3">
                                        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[var(--experience-hero-gradient-from)] to-[var(--experience-hero-gradient-to)] flex items-center justify-center">
                                          <CheckCircle className="h-8 w-8 text-white" />
                                        </div>
                                        <DialogTitle className="text-2xl text-center">Approve Experience</DialogTitle>
                                        <p className="text-sm text-muted-foreground text-center">
                                          Select a grade to evaluate the student&apos;s performance
                                        </p>
                                      </DialogHeader>

                                      <div className="space-y-6 py-4">
                                        {/* Grade Selection Grid */}
                                        <div className="space-y-3">
                                          <label className="text-sm font-semibold flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-[var(--experience-accent)]" />
                                            Select Grade (2-6)
                                          </label>
                                          <div className="grid grid-cols-5 gap-3">
                                            {[2, 3, 4, 5, 6].map((gradeValue) => (
                                                <button
                                                    key={gradeValue}
                                                    type="button"
                                                    onClick={() => {
                                                      setExperiences((prev) =>
                                                          prev.map((ex) => (ex.id === exp.id ? { ...ex, grade: gradeValue } : ex)),
                                                      )
                                                    }}
                                                    className={`
                                                                                    relative aspect-square rounded-2xl border-2 transition-all duration-300
                                                                                    flex flex-col items-center justify-center gap-1 p-3
                                                                                    hover:scale-105 hover:shadow-lg
                                                                                    ${
                                                        exp.grade === gradeValue
                                                            ? "border-[var(--experience-accent)] bg-gradient-to-br from-[var(--experience-hero-gradient-from)] to-[var(--experience-hero-gradient-to)] text-white shadow-lg shadow-[var(--experience-accent)]/30"
                                                            : "border-[var(--experience-step-border)] bg-[var(--experience-step-background)] hover:border-[var(--experience-accent)]/50"
                                                    }
                                                                                `}
                                                >
                                        <span
                                            className={`text-2xl font-bold ${exp.grade === gradeValue ? "text-white" : "text-foreground"}`}
                                        >
                                          {gradeValue}
                                        </span>
                                                  {exp.grade === gradeValue && (
                                                      <CheckCircle className="h-4 w-4 text-white absolute top-1 right-1" />
                                                  )}
                                                </button>
                                            ))}
                                          </div>

                                          {/* Grade Description */}
                                          {exp.grade && (
                                              <div className="mt-4 p-4 rounded-2xl bg-[var(--experience-step-background)] border border-[var(--experience-step-border)]">
                                                <p className="text-sm font-medium text-[var(--experience-accent)] mb-1">
                                                  Grade {exp.grade} Selected
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  {exp.grade === 2 && "Basic performance - Needs significant improvement"}
                                                  {exp.grade === 3 && "Satisfactory performance - Meets minimum requirements"}
                                                  {exp.grade === 4 && "Good performance - Meets expectations"}
                                                  {exp.grade === 5 && "Very good performance - Exceeds expectations"}
                                                  {exp.grade === 6 && "Excellent performance - Outstanding work"}
                                                </p>
                                              </div>
                                          )}
                                        </div>
                                      </div>

                                      <DialogFooter className="flex gap-3 sm:gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1 rounded-2xl border-2 bg-transparent"
                                            onClick={() => {
                                              const dialog = document.querySelector<HTMLButtonElement>("[data-state='open']")
                                              dialog?.click()
                                            }}
                                        >
                                          Cancel
                                        </Button>

                                        <Button
                                            disabled={exp.grade == null || exp.grade < 2 || exp.grade > 6}
                                            onClick={() => handleAction(exp.id, "approve", exp.grade!)}
                                            className="flex-1 rounded-2xl bg-gradient-to-r from-[var(--experience-hero-gradient-from)] to-[var(--experience-hero-gradient-to)] hover:opacity-90 text-white font-semibold disabled:opacity-50"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Confirm Approval
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>

                                  <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleAction(exp.id, "reject")}
                                      className="w-full mt-2 rounded-2xl"
                                  >
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                  ))}
                </div>
              </>
          )}
        </section>
      </div>
  )
}

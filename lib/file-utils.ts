export interface FileAttachment {
    id: string
    name: string
    url: string
    type: string
    size: number
    path?: string
}

export const ALLOWED_FILE_TYPES = {
    images: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
    documents: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    ],
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = [...ALLOWED_FILE_TYPES.images, ...ALLOWED_FILE_TYPES.documents]

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: "Invalid file type. Only images, PDFs, and documents are allowed.",
        }
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: "File too large. Maximum size is 10MB.",
        }
    }

    return { valid: true }
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function getFileIcon(fileType: string): string {
    if (ALLOWED_FILE_TYPES.images.includes(fileType)) {
        return "🖼️"
    }
    if (fileType === "application/pdf") {
        return "📄"
    }
    if (fileType.includes("word") || fileType === "text/plain") {
        return "📝"
    }
    return "📎"
}

export async function uploadFile(file: File, section: string): Promise<FileAttachment> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("section", section)

    const response = await fetch("/api/portfolio/upload", { // 👈 correct path
        method: "POST",
        body: formData,
    })

    if (!response.ok) {
        const text = await response.text() // 👈 debug
        throw new Error(`Upload failed: ${text}`)
    }

    const result = await response.json()
    return result.file
}


export async function deleteFile(filePath: string): Promise<void> {
    const response = await fetch(`/api/portfolio/upload?path=${encodeURIComponent(filePath)}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Delete failed");
    }
}


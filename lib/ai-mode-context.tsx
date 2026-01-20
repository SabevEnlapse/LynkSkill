"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"

interface AIMessage {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
    metadata?: {
        type?: "portfolio" | "match" | "question" | "search"
        data?: unknown
    }
}

interface InternshipMatch {
    id: string
    title: string
    company: string
    matchPercentage: number
    reasons: string[]
    skills: string[]
}

interface StudentMatch {
    id: string
    name: string
    email: string
    matchPercentage: number
    reasons: string[]
    skills: string[]
    portfolio?: {
        headline?: string
        about?: string
    }
}

interface AIModeContextType {
    isAIMode: boolean
    toggleAIMode: () => void
    messages: AIMessage[]
    addMessage: (message: Omit<AIMessage, "id" | "timestamp">) => void
    clearMessages: () => void
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
    internshipMatches: InternshipMatch[]
    setInternshipMatches: (matches: InternshipMatch[]) => void
    studentMatches: StudentMatch[]
    setStudentMatches: (matches: StudentMatch[]) => void
    generatedPortfolio: Record<string, unknown> | null
    setGeneratedPortfolio: (portfolio: Record<string, unknown> | null) => void
    chatPhase: "intro" | "gathering" | "portfolio" | "matching" | "results"
    setChatPhase: (phase: "intro" | "gathering" | "portfolio" | "matching" | "results") => void
    sendWelcomeMessage: (userType: "student" | "company") => void
    welcomeSent: boolean
}

const AIModeContext = createContext<AIModeContextType | undefined>(undefined)

export function AIModeProvider({ children }: { children: ReactNode }) {
    const [isAIMode, setIsAIMode] = useState(false)
    const [messages, setMessages] = useState<AIMessage[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [internshipMatches, setInternshipMatches] = useState<InternshipMatch[]>([])
    const [studentMatches, setStudentMatches] = useState<StudentMatch[]>([])
    const [generatedPortfolio, setGeneratedPortfolio] = useState<Record<string, unknown> | null>(null)
    const [chatPhase, setChatPhase] = useState<"intro" | "gathering" | "portfolio" | "matching" | "results">("intro")
    const [welcomeSent, setWelcomeSent] = useState(false)

    const toggleAIMode = useCallback(() => {
        setIsAIMode(prev => {
            if (prev) {
                // Resetting when turning off
                setMessages([])
                setChatPhase("intro")
                setInternshipMatches([])
                setStudentMatches([])
                setGeneratedPortfolio(null)
                setWelcomeSent(false)
            }
            return !prev
        })
    }, [])

    const addMessage = useCallback((message: Omit<AIMessage, "id" | "timestamp">) => {
        const newMessage: AIMessage = {
            ...message,
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, newMessage])
    }, [])

    const clearMessages = useCallback(() => {
        setMessages([])
        setChatPhase("intro")
        setWelcomeSent(false)
    }, [])

    const sendWelcomeMessage = useCallback((userType: "student" | "company") => {
        if (welcomeSent) return
        
        setWelcomeSent(true)
        
        const welcomeContent = userType === "company" 
            ? "👋 Hello! I'm Linky, your AI Talent Scout here at LynkSkill! I'm here to help you find the perfect candidates for your team without manually creating job postings.\n\nJust describe what kind of talent you're looking for - the skills needed, the type of role, experience level, or any specific requirements. I'll search through our student database and find the best matches for you!\n\n💡 Try something like: \"I need a React developer\" or \"Looking for a design intern with Figma skills\""
            : "👋 Hey there! I'm Linky, your AI Career Assistant here at LynkSkill! 🚀\n\nI'm here to help you build an awesome professional portfolio and find the perfect internship match for your skills and interests.\n\nTell me about yourself - What's your name, what are you studying, and what kind of work excites you? The more you share, the better I can help you stand out!"
        
        const newMessage: AIMessage = {
            id: `msg-welcome-${Date.now()}`,
            role: "assistant",
            content: welcomeContent,
            timestamp: new Date(),
            metadata: { type: "question" }
        }
        
        setMessages([newMessage])
        setChatPhase("gathering")
    }, [welcomeSent])

    return (
        <AIModeContext.Provider value={{
            isAIMode,
            toggleAIMode,
            messages,
            addMessage,
            clearMessages,
            isLoading,
            setIsLoading,
            internshipMatches,
            setInternshipMatches,
            studentMatches,
            setStudentMatches,
            generatedPortfolio,
            setGeneratedPortfolio,
            chatPhase,
            setChatPhase,
            sendWelcomeMessage,
            welcomeSent
        }}>
            {children}
        </AIModeContext.Provider>
    )
}

export function useAIMode() {
    const context = useContext(AIModeContext)
    if (!context) {
        throw new Error("useAIMode must be used within an AIModeProvider")
    }
    return context
}

"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Send, 
    Sparkles, 
    User, 
    Bot, 
    Loader2, 
    CheckCircle2, 
    Briefcase,
    Target,
    TrendingUp,
    ArrowRight,
    RefreshCw,
    FileText,
    Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { useAIMode } from "@/lib/ai-mode-context"
import { cn } from "@/lib/utils"

export function StudentAIChat() {
    const { 
        messages, 
        addMessage, 
        isLoading, 
        setIsLoading, 
        internshipMatches, 
        setInternshipMatches,
        generatedPortfolio,
        setGeneratedPortfolio,
        chatPhase,
        setChatPhase,
        clearMessages,
        sendWelcomeMessage,
        welcomeSent
    } = useAIMode()

    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Send initial greeting when AI mode is activated
    useEffect(() => {
        if (!welcomeSent) {
            sendWelcomeMessage("student")
        }
    }, [welcomeSent, sendWelcomeMessage])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim() || isLoading) return

        const userMessage = inputValue.trim()
        setInputValue("")
        
        addMessage({
            role: "user",
            content: userMessage
        })

        setIsLoading(true)
        setIsTyping(true)

        try {
            const response = await fetch("/api/assistant/ai-mode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: messages.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    phase: chatPhase,
                    userType: "student"
                })
            })

            const data = await response.json()

            if (data.error) {
                addMessage({
                    role: "assistant",
                    content: "I apologize, but I encountered an issue. Please try again or rephrase your message."
                })
            } else {
                addMessage({
                    role: "assistant",
                    content: data.reply,
                    metadata: { type: data.type, data: data.data }
                })

                // Update state based on response
                if (data.phase) {
                    setChatPhase(data.phase)
                }

                if (data.portfolio) {
                    setGeneratedPortfolio(data.portfolio)
                }

                if (data.matches) {
                    setInternshipMatches(data.matches)
                }
            }
        } catch (error) {
            console.error("AI Mode error:", error)
            addMessage({
                role: "assistant",
                content: "I'm having trouble connecting. Please check your connection and try again."
            })
        } finally {
            setIsLoading(false)
            setIsTyping(false)
        }
    }

    const handleStartOver = () => {
        clearMessages()
        setGeneratedPortfolio(null)
        setInternshipMatches([])
    }

    const getMatchColor = (percentage: number) => {
        if (percentage >= 80) return "from-green-500 to-emerald-500"
        if (percentage >= 60) return "from-blue-500 to-indigo-500"
        if (percentage >= 40) return "from-yellow-500 to-orange-500"
        return "from-gray-500 to-slate-500"
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-indigo-500/5 border border-purple-500/20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-violet-500/5 to-indigo-500/10" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-sm shadow-lg">
                                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                                AI Career Assistant
                            </h2>
                        </div>
                        <p className="text-muted-foreground text-sm md:text-base font-medium flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            Build your portfolio & find your perfect internship match
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleStartOver}
                        className="rounded-xl px-4 py-2 text-sm font-bold hover:bg-purple-500/10"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Start Over
                    </Button>
                </div>

                {/* Progress indicator */}
                <div className="relative z-10 mt-6">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span className={cn("flex items-center gap-1", chatPhase !== "intro" && "text-purple-600 dark:text-purple-400")}>
                            <User className="h-3 w-3" /> About You
                        </span>
                        <span className={cn("flex items-center gap-1", ["portfolio", "matching", "results"].includes(chatPhase) && "text-purple-600 dark:text-purple-400")}>
                            <FileText className="h-3 w-3" /> Portfolio
                        </span>
                        <span className={cn("flex items-center gap-1", ["matching", "results"].includes(chatPhase) && "text-purple-600 dark:text-purple-400")}>
                            <Target className="h-3 w-3" /> Matching
                        </span>
                        <span className={cn("flex items-center gap-1", chatPhase === "results" && "text-purple-600 dark:text-purple-400")}>
                            <CheckCircle2 className="h-3 w-3" /> Results
                        </span>
                    </div>
                    <Progress 
                        value={
                            chatPhase === "intro" ? 0 :
                            chatPhase === "gathering" ? 25 :
                            chatPhase === "portfolio" ? 50 :
                            chatPhase === "matching" ? 75 : 100
                        } 
                        className="h-2 bg-purple-500/20"
                    />
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                {/* Chat Section */}
                <div className="lg:col-span-2 flex flex-col rounded-2xl border-2 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            <AnimatePresence>
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className={cn(
                                            "flex gap-3",
                                            message.role === "user" ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {message.role === "assistant" && (
                                            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 h-fit">
                                                <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                        )}

                                        <div className={cn(
                                            "max-w-[80%] rounded-2xl px-4 py-3",
                                            message.role === "user" 
                                                ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white"
                                                : "bg-muted/50 border border-border/50"
                                        )}>
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        </div>

                                        {message.role === "user" && (
                                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 h-fit">
                                                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20">
                                        <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="bg-muted/50 border border-border/50 rounded-2xl px-4 py-3">
                                        <div className="flex gap-1">
                                            <motion.div
                                                animate={{ opacity: [0.4, 1, 0.4] }}
                                                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                                className="w-2 h-2 rounded-full bg-purple-500"
                                            />
                                            <motion.div
                                                animate={{ opacity: [0.4, 1, 0.4] }}
                                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                                className="w-2 h-2 rounded-full bg-purple-500"
                                            />
                                            <motion.div
                                                animate={{ opacity: [0.4, 1, 0.4] }}
                                                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                                className="w-2 h-2 rounded-full bg-purple-500"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 bg-muted/20">
                        <div className="flex gap-3">
                            <Input
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Tell me about yourself..."
                                className="flex-1 rounded-xl border-2 border-border/50 focus:border-purple-500/50 bg-background"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                disabled={!inputValue.trim() || isLoading}
                                className="rounded-xl px-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Results Sidebar */}
                <div className="space-y-4 overflow-auto">
                    {/* Generated Portfolio Preview */}
                    {generatedPortfolio && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-violet-500/5">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-purple-600" />
                                        Your Portfolio
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {Boolean(generatedPortfolio.headline) && (
                                        <div>
                                            <p className="text-xs text-muted-foreground">Headline</p>
                                            <p className="text-sm font-medium">{String(generatedPortfolio.headline)}</p>
                                        </div>
                                    )}
                                    {Boolean(generatedPortfolio.skills) && Array.isArray(generatedPortfolio.skills) && (
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Skills</p>
                                            <div className="flex flex-wrap gap-1">
                                                {(generatedPortfolio.skills as string[]).slice(0, 5).map((skill, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {(generatedPortfolio.skills as string[]).length > 5 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{(generatedPortfolio.skills as string[]).length - 5}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full mt-2 rounded-xl text-purple-600 border-purple-500/30 hover:bg-purple-500/10"
                                    >
                                        View Full Portfolio
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Internship Matches */}
                    {internshipMatches.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-blue-600" />
                                        Top Matches
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {internshipMatches.slice(0, 5).map((match, index) => (
                                        <motion.div
                                            key={match.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{match.title}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{match.company}</p>
                                                </div>
                                                <div className={cn(
                                                    "flex-shrink-0 px-2 py-1 rounded-lg text-white text-xs font-bold bg-gradient-to-r",
                                                    getMatchColor(match.matchPercentage)
                                                )}>
                                                    {match.matchPercentage}%
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {(match.skills || []).slice(0, 3).map((skill, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs py-0">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Empty state */}
                    {!generatedPortfolio && internshipMatches.length === 0 && (
                        <Card className="border-dashed border-2 border-border/50">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="p-4 rounded-2xl bg-purple-500/10 mb-4">
                                    <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Chat with the AI to build your portfolio and discover matching internships
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

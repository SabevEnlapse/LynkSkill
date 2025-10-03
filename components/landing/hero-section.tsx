"use client"

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Users, Briefcase } from "lucide-react"

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 dot-grid opacity-30" />
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(circle at 50% 50%, transparent 0%, var(--background) 70%)",
                    }}
                />
            </div>

            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full opacity-20 blur-3xl bg-gradient-to-br from-purple-600 to-blue-600"
                    animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
                    transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full opacity-20 blur-3xl bg-gradient-to-br from-blue-600 to-purple-600"
                    animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto text-center space-y-6 md:space-y-8">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full border-2 border-purple-500/30 bg-purple-500/10 backdrop-blur-md shadow-lg"
                >
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                    <span className="text-sm md:text-base font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Connecting Students with Opportunities
          </span>
                </motion.div>

                {/* Main Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-4 md:space-y-6"
                >
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
                        Welcome to{" "}
                        <span className="relative inline-block">
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                LynkSkill
              </span>
              <motion.div
                  className="absolute -inset-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-2xl -z-10"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
            </span>
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed text-balance font-medium px-4">
                        The ultimate platform bridging the gap between talented students and innovative businesses.{" "}
                        <span className="text-foreground font-semibold">Manage internships</span>,{" "}
                        <span className="text-foreground font-semibold">showcase portfolios</span>, and{" "}
                        <span className="text-foreground font-semibold">celebrate achievements</span>—all in one place.
                    </p>
                </motion.div>

                {/* Auth Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center pt-4 md:pt-8 px-4"
                >
                    <SignedOut>
                        <SignUpButton forceRedirectUrl="/redirect-after-signin">
                            <Button
                                size="lg"
                                className="group relative overflow-hidden rounded-full px-6 py-5 md:px-10 md:py-7 text-base md:text-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto sm:min-w-[200px] md:min-w-[240px] bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white border-0 shadow-2xl shadow-purple-500/50"
                            >
                <span className="relative flex items-center justify-center gap-2 md:gap-3">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                            </Button>
                        </SignUpButton>

                        <SignInButton forceRedirectUrl="/redirect-after-signin">
                            <Button
                                size="lg"
                                variant="outline"
                                className="group relative overflow-hidden rounded-full px-6 py-5 md:px-10 md:py-7 text-base md:text-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto sm:min-w-[200px] md:min-w-[240px] border-2 border-purple-500/40 hover:border-purple-500/80 bg-background/80 backdrop-blur-md shadow-xl"
                            >
                <span className="relative flex items-center justify-center gap-2 md:gap-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Sign In
                </span>
                            </Button>
                        </SignInButton>
                    </SignedOut>

                    <SignedIn>
                        <div className="flex items-center gap-4 md:gap-6 px-6 md:px-8 py-3 md:py-4 rounded-full bg-card/50 backdrop-blur-md border-2 border-purple-500/30 shadow-xl">
                            <UserButton
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox:
                                            "w-10 h-10 md:w-14 md:h-14 ring-2 ring-purple-500/50 ring-offset-2 md:ring-offset-4 ring-offset-background transition-all duration-300 hover:ring-purple-400",
                                        userButtonPopoverCard: "bg-card backdrop-blur-sm border border-border shadow-2xl",
                                        userButtonPopoverActionButton: "hover:bg-accent transition-colors",
                                    },
                                }}
                            />
                            <span className="text-base md:text-xl font-semibold">Welcome back!</span>
                        </div>
                    </SignedIn>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-wrap items-center justify-center gap-6 md:gap-12 pt-8 md:pt-12 text-sm md:text-base text-muted-foreground px-4"
                >
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                        <span className="font-medium">Live Platform</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                        <span className="font-medium">10,000+ Students</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                        <span className="font-medium">500+ Companies</span>
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 cursor-pointer hidden md:flex"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
                <div className="flex flex-col items-center gap-2">
                    <span className="text-sm text-muted-foreground font-medium">Scroll to explore</span>
                    <div className="w-6 h-10 md:w-8 md:h-12 border-2 border-purple-500/40 rounded-full flex items-start justify-center p-2">
                        <motion.div
                            className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"
                            animate={{ y: [0, 16, 0] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        />
                    </div>
                </div>
            </motion.div>
        </section>
    )
}

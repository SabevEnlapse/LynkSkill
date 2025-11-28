import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck, Database, Eye, Lock, Cookie, AlertCircle } from "lucide-react"

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="p-4 bg-primary/10 rounded-2xl">
                            <ShieldCheck className="w-12 h-12 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-balance">Privacy Policy – LynkSkill</h1>
                    <p className="text-muted-foreground text-lg">Last updated: January 2025</p>
                </div>

                {/* Introduction */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Privacy for LynkSkill Users</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 leading-relaxed">
                        <p className="text-muted-foreground">
                            LynkSkill is a national digital platform designed to connect students, companies, 
                            organizations, and schools across Bulgaria. Because we process educational, 
                            organizational, and potentially sensitive personal information, your privacy 
                            and data protection are foundational responsibilities for us.
                        </p>

                        <p className="text-muted-foreground">
                            This Privacy Policy explains how LynkSkill collects, uses, stores, and safeguards 
                            your personal information when you create an account, browse the platform, 
                            apply for internships, publish opportunities, or interact with any LynkSkill service.
                        </p>
                    </CardContent>
                </Card>

                {/* Information We Collect */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            Information We Collect
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6 leading-relaxed">

                        {/* Personal Information */}
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Personal Information</h3>
                            <p className="text-muted-foreground mb-3">
                                We collect information you voluntarily provide during registration or when 
                                completing your profile. Examples include:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                <li>Name and email address</li>
                                <li>Account credentials (via Clerk authentication)</li>
                                <li>Profile information (skills, bio, school, interests)</li>
                                <li>Company details for business accounts</li>
                                <li>Date of birth for student verification</li>
                            </ul>
                        </div>

                        <Separator />

                        {/* Automatic data */}
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Automatically Collected Information</h3>
                            <p className="text-muted-foreground mb-3">
                                When you access LynkSkill, the system may automatically collect:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                <li>Device and browser information</li>
                                <li>IP address and approximate location</li>
                                <li>Usage behavior and analytics</li>
                                <li>Cookie data and tracking identifiers</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* How We Use Data */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            How We Use Your Information
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4 leading-relaxed">
                        <p className="text-muted-foreground">
                            LynkSkill uses collected data to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li>Create and authenticate user accounts</li>
                            <li>Match students with relevant internships and opportunities</li>
                            <li>Enable companies and schools to manage and publish listings</li>
                            <li>Improve platform performance and user experience</li>
                            <li>Ensure safety and prevent abuse or fraud</li>
                            <li>Comply with Bulgarian and EU legal obligations (GDPR)</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Data Security */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            Data Security
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4 leading-relaxed">
                        <p className="text-muted-foreground">
                            LynkSkill implements security measures such as encryption, access control, 
                            secure authentication through Clerk, and continuous monitoring. However, 
                            no method of transmission on the internet is fully secure.
                        </p>

                        <div className="bg-muted/50 p-4 rounded-lg border border-border">
                            <p className="text-sm">
                                <strong>Includes:</strong> encrypted data storage, TLS protection, 
                                security audits, and role-based access controls.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Cookies */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Cookie className="w-5 h-5" />
                            Cookies and Tracking
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4 leading-relaxed">
                        <p className="text-muted-foreground">
                            LynkSkill uses cookies for authentication, session management, and analytics.
                        </p>

                        <h3 className="font-semibold mb-2">Types of cookies:</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li><strong>Essential:</strong> login and session management</li>
                            <li><strong>Analytics:</strong> usage measurement</li>
                            <li><strong>Preference:</strong> theme and UI settings</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* GDPR */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Your GDPR Rights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 leading-relaxed">
                        <p className="text-muted-foreground">EEA users have the following rights:</p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li>Right to access</li>
                            <li>Right to rectification</li>
                            <li>Right to erasure</li>
                            <li>Right to restrict processing</li>
                            <li>Right to data portability</li>
                            <li>Right to object</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Contact */}
                <Card className="shadow-lg bg-muted/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Contact Us
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-muted-foreground">
                            For privacy-related questions, please contact our team at{" "}
                            <a href="mailto:lynkskillweb@gmail.com" className="text-primary underline underline-offset-4">
                                lynkskillweb@gmail.com
                            </a>
                        </p>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Scale, FileText, Shield, AlertCircle } from "lucide-react"

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="p-4 bg-primary/10 rounded-2xl">
                            <Scale className="w-12 h-12 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-balance">Terms of Service</h1>
                    <p className="text-muted-foreground text-lg">Last updated: January 2025</p>
                </div>

                {/* AGREEMENT TO TERMS */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Agreement to Terms
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 leading-relaxed text-muted-foreground">
                        <p>
                            By accessing and using LynkSkill (“the Platform”), you confirm that you have read, understood,
                            and agree to be bound by these Terms of Service. If you do not agree with any part of these Terms,
                            you must discontinue use of the Platform immediately.
                        </p>
                    </CardContent>
                </Card>

                {/* USER RESPONSIBILITIES */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            User Responsibilities
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 leading-relaxed">

                        {/* Account Registration */}
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Account Registration</h3>
                            <p className="text-muted-foreground">
                                You agree to provide accurate, current, and complete information during registration. You are
                                responsible for maintaining the confidentiality of your account credentials and for all activities
                                conducted under your account.
                            </p>
                        </div>

                        <Separator />

                        {/* Acceptable Use */}
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Acceptable Use</h3>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                <li>You will not use the Platform for any unlawful or unauthorized purpose</li>
                                <li>You will not upload, distribute, or transmit malicious code or harmful software</li>
                                <li>You will not attempt to gain unauthorized access to systems, accounts, or sensitive data</li>
                                <li>You will not misrepresent your identity, age, or company details</li>
                                <li>You will not share or publish illegal, harmful, discriminatory, or sexualized content</li>
                            </ul>
                        </div>

                        <Separator />

                        {/* Company Verification */}
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Company Verification</h3>
                            <p className="text-muted-foreground">
                                Companies using LynkSkill must provide accurate and verifiable information including legal
                                identifiers (EIK/BULSTAT). Providing false or misleading data may result in suspension,
                                permanent removal, or reporting to Bulgarian authorities under applicable laws, including
                                <strong> Article 313 of the Bulgarian Penal Code</strong>.
                            </p>
                        </div>

                        <Separator />

                        {/* Student Information */}
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Student Information and Misrepresentation</h3>
                            <p className="text-muted-foreground">
                                Students must provide accurate personal and age information. Deliberately falsifying identity,
                                age, or school details may result in account suspension and notification to educational
                                institutions or guardians.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* INTELLECTUAL PROPERTY */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Intellectual Property</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 leading-relaxed">
                        <p className="text-muted-foreground">
                            All trademarks, branding, UI components, platform design, and original content are the intellectual
                            property of LynkSkill and are protected under Bulgarian copyright law, EU directives, and
                            international intellectual property treaties. Unauthorized reproduction or distribution is strictly
                            prohibited.
                        </p>
                    </CardContent>
                </Card>

                {/* LIMITATION OF LIABILITY */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Limitation of Liability</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 leading-relaxed">
                        <p className="text-muted-foreground">
                            LynkSkill is not responsible for indirect, incidental, or consequential damages, including loss
                            of data, profits, goodwill, or business opportunities. LynkSkill is not an employer and is not
                            liable for any internship, training, or work-related outcomes or disputes between users.
                        </p>
                    </CardContent>
                </Card>

                {/* TERMINATION */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Termination</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 leading-relaxed">
                        <p className="text-muted-foreground">
                            LynkSkill may suspend or terminate accounts without prior notice if users violate these Terms,
                            provide false information, engage in harmful or illegal activity, or refuse identity, age,
                            or company verification.
                        </p>
                    </CardContent>
                </Card>

                {/* GOVERNING LAW */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Governing Law</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 leading-relaxed">
                        <p className="text-muted-foreground">
                            These Terms are governed by Bulgarian legislation, EU regulations, GDPR, the Bulgarian Personal
                            Data Protection Act (ZZD), and the Electronic Trade Act (ZET).
                        </p>
                    </CardContent>
                </Card>

                {/* CHANGES TO TERMS */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Changes to Terms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 leading-relaxed">
                        <p className="text-muted-foreground">
                            LynkSkill may update these Terms at any time. Significant changes will be announced on the
                            Platform. Continued use after changes constitutes acceptance of the revised Terms.
                        </p>
                    </CardContent>
                </Card>

                {/* CONTACT */}
                <Card className="shadow-lg bg-muted/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Contact Us
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="leading-relaxed">
                        <p className="text-muted-foreground">
                            For legal inquiries, contact us at{" "}
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

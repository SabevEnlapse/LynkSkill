import RequireAuth from "@/components/RequireAuth";

export default function OnboardingLayout({children}: { children: React.ReactNode }) {
    return (
        <>
            <RequireAuth>
                {children}
            </RequireAuth>
        </>
    )
}

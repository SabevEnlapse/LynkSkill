export {}

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            onboardingComplete?: boolean
            role?: 'student' | 'company'
        }
    }
}

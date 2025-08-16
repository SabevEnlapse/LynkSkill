'use client'

import * as React from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from './_actions'

export default function OnboardingPage() {
    const [error, setError] = React.useState('')
    const { user } = useUser()
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        const res = await completeOnboarding(formData)
        if (res?.message) {
            await user?.reload()
            router.push('/')
        }
        if (res?.error) setError(res.error)
    }

    return (
        <div>
            <h1>Onboarding</h1>
            <form action={handleSubmit}>
                <div>
                    <label>
                        <input type="radio" name="role" value="student" required /> Student
                    </label>
                    <label>
                        <input type="radio" name="role" value="company" required /> Company
                    </label>
                </div>
                {error && <p className="text-red-600">Error: {error}</p>}
                <button type="submit">Continue</button>
            </form>
        </div>
    )
}

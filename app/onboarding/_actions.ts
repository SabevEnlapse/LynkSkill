'use server'

import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/clerk-sdk-node'
import { prisma } from '@/lib/prisma'

export async function completeOnboarding(formData: FormData) {
    const { userId } = await auth()
    if (!userId) {
        return { error: 'No logged in user' }
    }

    const roleInput = formData.get('role') as 'student' | 'company'
    const role = roleInput.toUpperCase() as 'STUDENT' | 'COMPANY'

    try {
        // Update Clerk user metadata
        await clerkClient.users.updateUser(userId, {
            publicMetadata: { onboardingComplete: true, role: roleInput },
        })

        // Get Clerk user (email)
        const clerkUser = await clerkClient.users.getUser(userId)
        const email =
            clerkUser.emailAddresses.find(
                (e) => e.id === clerkUser.primaryEmailAddressId
            )?.emailAddress || ''

        // Upsert in Prisma (Supabase)
        await prisma.user.upsert({
            where: { clerkId: userId },
            update: { role },
            create: {
                clerkId: userId,
                email,
                role,
            },
        })

        return { message: 'Onboarding complete' }
    } catch (err) {
        console.error('Onboarding error:', err)
        return { error: 'Error updating metadata' }
    }
}

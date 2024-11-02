import { getServerSession } from "next-auth/next"
import { useSession } from 'next-auth/react'

interface UserProfile {
    id: string;
    email: string;
    // Add other fields as necessary
}

let cachedUserProfile: UserProfile | null = null;

export async function getUserProfile() {
    if (cachedUserProfile) {
        return cachedUserProfile;
    }

    const session = await getServerSession();
    if (!session?.user.accessToken) {
        return null;
    }

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${session.user.accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error('Failed to fetch user profile');
        }

        const userProfile = await res.json();
        cachedUserProfile = userProfile;
        return userProfile;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}
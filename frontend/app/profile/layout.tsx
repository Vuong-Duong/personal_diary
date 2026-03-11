import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Profile - Share',
    description: 'View and edit your user profile',
}

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Saved Posts - Share',
    description: 'Manage your saved posts and control their visibility',
}

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}

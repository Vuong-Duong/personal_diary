import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Private Posts - Share',
    description: 'Manage your private posts and control their visibility',
}

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}

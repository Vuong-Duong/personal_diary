import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Admin Dashboard - Quản lý người dùng',
    description: 'Trang quản lý tài khoản người dùng - Admin Dashboard',
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}

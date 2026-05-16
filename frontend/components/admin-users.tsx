'use client'

import { useEffect, useState } from 'react'
import { UserManagementTable } from '@/components/user-management-table'
import { Sidebar } from '@/components/sidebar'
import { TopHeader } from '@/components/top-header'
import { Button } from '@/components/ui/button'
import { Download, Search } from 'lucide-react'
import { getAllUsers, deleteUser as deleteUserApi } from '@/api/user.api'
import type { User } from '@/types'
import { useToast } from '@/hooks/use-toast'

type TableUser = User & { createdAt: Date }

export function AdminUsers() {
    const [users, setUsers] = useState<TableUser[]>([])
    const [searchName, setSearchName] = useState('')
    const [searchEmail, setSearchEmail] = useState('')
    const [searchId, setSearchId] = useState('')
    const { toast } = useToast()

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await getAllUsers()
                setUsers(
                    data.map((u) => ({
                        ...u,
                        // cast sang Date cho bảng, type gốc vẫn string
                        createdAt: new Date(u.createdAt),
                    })) as TableUser[],
                )
            } catch (error: any) {
                toast({
                    title: 'Lỗi',
                    description: error?.message || 'Không thể tải danh sách người dùng',
                    variant: 'destructive',
                })
            }
        }
        loadUsers()
    }, [toast])

    const handleDeleteUser = async (id: string) => {
        try {
            await deleteUserApi(id)
            setUsers((prev) => prev.filter((user) => user.id !== id))
            toast({
                title: 'Thành công',
                description: 'Người dùng đã được xóa',
            })
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error?.message || 'Không thể xóa người dùng',
                variant: 'destructive',
            })
        }
    }

    const exportToCSV = () => {
        const headers = ['ID', 'Name', 'Email', 'Created Date']
        const rows = users.map((user) => [
            user.id,
            user.name,
            user.email,
            new Date(user.createdAt).toLocaleDateString('vi-VN'),
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `users_${new Date().getTime()}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Filter users based on search terms
    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchName.toLowerCase()) &&
        user.email.toLowerCase().includes(searchEmail.toLowerCase()) &&
        user.id.toLowerCase().includes(searchId.toLowerCase())
    )

    return (
        <>
            <TopHeader />
            <Sidebar />
            <div className="min-h-screen bg-background pt-24 p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground">Quản lý người dùng</h1>
                        <p className="text-muted-foreground mt-2">
                            Quản lý và theo dõi tài khoản người dùng của bạn
                        </p>
                    </div>

                    {/* Filters and Export */}
                    <div className="mb-6 flex gap-3 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên..."
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                className="w-full pl-10 pr-4 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo email..."
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo ID..."
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                className="w-full pl-10 pr-4 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <Button onClick={exportToCSV} variant="outline" className="gap-2 whitespace-nowrap">
                            <Download className="h-4 w-4" />
                            Xuất CSV
                        </Button>
                    </div>

                    {/* Users Table */}
                    <UserManagementTable
                        users={filteredUsers}
                        onDelete={handleDeleteUser}
                    />

                    {/* Empty State */}
                    {filteredUsers.length === 0 && (
                        <div className="rounded-lg border border-border bg-card p-8 text-center">
                            <p className="text-muted-foreground">
                                {users.length === 0
                                    ? 'Không tìm thấy người dùng nào phù hợp với tiêu chí tìm kiếm'
                                    : 'Không tìm thấy người dùng nào khớp với tìm kiếm'}
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </>
    )
}

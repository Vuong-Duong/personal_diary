'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'

import type { User } from '@/types'

interface UserManagementTableProps {
    users: User[]
    onDelete: (id: string) => void
}

export function UserManagementTable({
    users,
    onDelete,
}: UserManagementTableProps) {
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const handleDeleteClick = (userId: string) => {
        setDeleteUserId(userId)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = () => {
        if (deleteUserId) {
            onDelete(deleteUserId)
            setIsDeleteDialogOpen(false)
            setDeleteUserId(null)
        }
    }

    return (
        <>
            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    {/* Header */}
                    <thead>
                        <tr className="border-b border-border bg-muted">
                            <th className="px-6 py-3 text-left font-semibold text-foreground">ID</th>
                            <th className="px-6 py-3 text-left font-semibold text-foreground">Tên</th>
                            <th className="px-6 py-3 text-left font-semibold text-foreground">Email</th>
                            <th className="px-6 py-3 text-left font-semibold text-foreground">Ngày tạo</th>
                            <th className="px-6 py-3 text-right font-semibold text-foreground">Hành động</th>
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="border-b border-border hover:bg-muted/50 transition-colors"
                            >
                                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                    {user.id}
                                </td>
                                <td className="px-6 py-4 font-medium text-foreground">{user.name}</td>
                                <td className="px-6 py-4 text-foreground">{user.email}</td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDeleteClick(user.id)}
                                            title="Xóa"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa người dùng?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Người dùng sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Xóa
                    </AlertDialogAction>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

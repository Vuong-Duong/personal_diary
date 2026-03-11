'use client'

import { useState } from 'react'
import { Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface PrivatePost {
    id: string
    title: string
    content: string
    visibility: 'PRIVATE' | 'PUBLIC'
    createdAt: Date
}

// Mock data
const MOCK_PRIVATE_POSTS: PrivatePost[] = [
    {
        id: '1',
        title: 'Bài viết cá nhân #1',
        content: 'Đây là bài viết riêng tư của tôi. Chỉ mình tôi có thể nhìn thấy.',
        visibility: 'PRIVATE',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
        id: '2',
        title: 'Ý tưởng cho bài viết tiếp theo',
        content: 'Tôi đang suy nghĩ về...',
        visibility: 'PRIVATE',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
]

export function PrivatePosts() {
    const [posts, setPosts] = useState(MOCK_PRIVATE_POSTS)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const handleDelete = (id: string) => {
        setPosts(posts.filter((post) => post.id !== id))
        setDeleteId(null)
    }

    const handleToggleVisibility = (id: string) => {
        setPosts(
            posts.map((post) => {
                if (post.id === id) {
                    return {
                        ...post,
                        visibility: post.visibility === 'PRIVATE' ? 'PUBLIC' : 'PRIVATE',
                    }
                }
                return post
            })
        )
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="ml-64 min-h-screen bg-background p-8">
            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Bài viết cá nhân</h1>
                    <p className="text-muted-foreground mt-2">
                        Quản lý bài viết riêng tư của bạn
                    </p>
                </div>

                {/* Posts List */}
                {posts.length > 0 ? (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <Card key={post.id} className="overflow-hidden bg-card">
                                <div className="p-6">
                                    {/* Title and Status */}
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <h2 className="text-xl font-semibold text-card-foreground">
                                            {post.title}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            {post.visibility === 'PRIVATE' ? (
                                                <span className="inline-flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">
                                                    <EyeOff className="h-3 w-3" />
                                                    Riêng tư
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                                                    <Eye className="h-3 w-3" />
                                                    Công khai
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <p className="text-card-foreground mb-4 line-clamp-2">
                                        {post.content}
                                    </p>

                                    {/* Meta */}
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {formatDate(post.createdAt)}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleToggleVisibility(post.id)}
                                            className="gap-2"
                                        >
                                            {post.visibility === 'PRIVATE' ? (
                                                <>
                                                    <Eye className="h-4 w-4" />
                                                    Công khai
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="h-4 w-4" />
                                                    Riêng tư
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteId(post.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Xóa
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="bg-card p-8 text-center">
                        <p className="text-muted-foreground">Bạn chưa có bài viết riêng tư nào</p>
                    </Card>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Bài viết sẽ bị xóa vĩnh viễn.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => deleteId && handleDelete(deleteId)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Xóa
                    </AlertDialogAction>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

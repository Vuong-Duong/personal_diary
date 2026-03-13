'use client'

import { useState, useEffect } from 'react'
import { Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getUserIdFromToken } from '@/api/user.api'
import { deletePost, updatePost, getUserPosts } from '@/api/post.api'
import type { Post } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface PrivatePost extends Post {
    createdAt: string
}

export function PrivatePosts() {
    const [posts, setPosts] = useState<PrivatePost[]>([])
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        loadPrivatePosts()
    }, [])

    const loadPrivatePosts = async () => {
        try {
            setIsLoading(true)
            const userId = getUserIdFromToken()
            if (!userId) {
                toast({
                    title: 'Lỗi',
                    description: 'Vui lòng đăng nhập',
                    variant: 'destructive',
                })
                return
            }

            const response = await getUserPosts(userId)
            const allPosts = response.posts || []

            // Filter only private posts
            const privatePosts = allPosts.filter((post: any) =>
                post.visibility === 'PRIVATE' || post.status === 'DRAFT'
            )

            setPosts(privatePosts)
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể tải bài viết',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deletePost(id)
            setPosts(posts.filter((post) => post.id !== id))
            setDeleteId(null)

            toast({
                title: 'Thành công',
                description: 'Bài viết đã được xóa',
            })
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể xóa bài viết',
                variant: 'destructive',
            })
        }
    }

    const handleToggleVisibility = async (id: string) => {
        const post = posts.find(p => p.id === id)
        if (!post) return

        try {
            const newVisibility = post.visibility === 'PRIVATE' ? 'PUBLIC' : 'PRIVATE'
            await updatePost(id, {
                visibility: newVisibility as 'PRIVATE' | 'PUBLIC',
            })

            setPosts(
                posts.map((p) => {
                    if (p.id === id) {
                        return {
                            ...p,
                            visibility: newVisibility as 'PRIVATE' | 'PUBLIC',
                        }
                    }
                    return p
                })
            )

            toast({
                title: 'Thành công',
                description: `Bài viết đã được đổi thành ${newVisibility === 'PRIVATE' ? 'riêng tư' : 'công khai'}`,
            })
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể cập nhật bài viết',
                variant: 'destructive',
            })
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
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
                {isLoading ? (
                    <p className="text-center text-muted-foreground">Đang tải bài viết...</p>
                ) : posts.length > 0 ? (
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

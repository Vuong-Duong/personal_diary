'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, Eye, EyeOff, Plus } from 'lucide-react'
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
import { publishPost, getUserPosts, createPost as createPostAPI, moveToTrash } from '@/api/post.api'
import type { Post } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface PrivatePost extends Post {
    createdAt: string
}

export function PrivatePosts() {
    const [posts, setPosts] = useState<PrivatePost[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newContent, setNewContent] = useState('')
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        loadPrivatePosts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const loadPrivatePosts = useCallback(async () => {
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
    }, [toast])

    const handleCreatePrivatePost = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newTitle.trim() || !newContent.trim()) {
            toast({
                title: 'Lỗi',
                description: 'Vui lòng nhập tiêu đề và nội dung',
                variant: 'destructive',
            })
            return
        }

        try {
            setIsCreating(true)
            const created = await createPostAPI({
                title: newTitle.trim(),
                content: newContent.trim(),
                visibility: 'PRIVATE',
                isAnonymous: false,
                status: 'DRAFT',
            })

            // Thêm bài viết mới lên đầu danh sách
            setPosts((prev) => [
                created as PrivatePost,
                ...prev,
            ])

            setNewTitle('')
            setNewContent('')

            toast({
                title: 'Thành công',
                description: 'Đã tạo bài viết riêng tư',
            })
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể tạo bài viết',
                variant: 'destructive',
            })
        } finally {
            setIsCreating(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await moveToTrash(id)
            setPosts(posts.filter((post) => post.id !== id))
            setDeleteId(null)

            toast({
                title: 'Thành công',
                description: 'Bài viết đã được chuyển vào thùng rác',
            })
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể chuyển bài viết vào thùng rác',
                variant: 'destructive',
            })
        }
    }

    const handleToggleVisibility = async (id: string) => {
        const post = posts.find(p => p.id === id)
        if (!post) return

        try {
            const updated = await publishPost(id)

            setPosts(
                posts.map((p) => {
                    if (p.id === id) {
                        return {
                            ...p,
                            visibility: updated.visibility,
                            status: updated.status,
                        }
                    }
                    return p
                })
            )

            toast({
                title: 'Thành công',
                description: `Bài viết đã được đổi thành ${updated.visibility === 'PRIVATE' ? 'riêng tư' : 'công khai'}`,
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
                        Quản lý và tạo bài viết riêng tư của bạn
                    </p>
                </div>

                {/* Create Private Post */}
                <Card className="bg-card p-6 mb-8">
                    <form onSubmit={handleCreatePrivatePost} className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-semibold text-card-foreground">
                                Tạo bài viết riêng tư
                            </h2>
                            <span className="inline-flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">
                                <EyeOff className="h-3 w-3" />
                                Chỉ mình tôi
                            </span>
                        </div>
                        <textarea
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[42px]"
                            placeholder="Tiêu đề..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                        <textarea
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[120px]"
                            placeholder="Nội dung..."
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                        />
                        <Button
                            type="submit"
                            className="w-full gap-2"
                            disabled={isCreating}
                        >
                            <Plus className="h-4 w-4" />
                            {isCreating ? 'Đang tạo...' : 'Tạo bài viết riêng tư'}
                        </Button>
                    </form>
                </Card>

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
                        <AlertDialogTitle>Chuyển vào thùng rác?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bài viết sẽ được chuyển vào thùng rác và tự động xóa sau 30 ngày.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => deleteId && handleDelete(deleteId)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Chuyển vào thùng rác
                    </AlertDialogAction>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}


'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2 } from 'lucide-react'
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
import { deletePost, getDeletedPosts } from '@/api/post.api'
import type { Post } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface PrivatePost extends Post {
    createdAt: string
}

export function PostHistory() {
    const [posts, setPosts] = useState<PrivatePost[]>([])
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const { toast } = useToast()

    useEffect(() => {
        loadPosts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const loadPosts = useCallback(async () => {
        try {
            setIsLoading(true)

            const response = await getDeletedPosts()
            const allPosts = response.posts || []

            setPosts(allPosts)

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

    const handleDelete = async (id: string) => {

        try {

            await deletePost(id)

            setPosts(posts.filter((post) => post.id !== id))

            setDeleteId(null)

            toast({
                title: 'Thành công',
                description: 'Bài viết đã được xóa vĩnh viễn',
            })

        } catch (error: any) {

            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể xóa bài viết',
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

                    <h1 className="text-3xl font-bold text-foreground">
                        Thùng rác
                    </h1>

                    <p className="text-muted-foreground mt-2">
                        Các bài viết đã xóa sẽ được lưu trong 30 ngày rồi tự động xóa
                    </p>

                </div>

                {/* Posts List */}

                {isLoading ? (

                    <p className="text-center text-muted-foreground">
                        Đang tải bài viết...
                    </p>

                ) : posts.length > 0 ? (

                    <div className="space-y-4">

                        {posts.map((post) => (

                            <Card key={post.id} className="overflow-hidden bg-card">

                                <div className="p-6">

                                    <h2 className="text-xl font-semibold text-card-foreground mb-3">
                                        {post.title}
                                    </h2>

                                    <p className="text-card-foreground mb-4 line-clamp-2">
                                        {post.content}
                                    </p>

                                    <p className="text-sm text-muted-foreground mb-4">
                                        {formatDate(post.createdAt)}
                                    </p>

                                    <div className="flex gap-2">

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteId(post.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Xóa vĩnh viễn
                                        </Button>

                                    </div>

                                </div>

                            </Card>

                        ))}

                    </div>

                ) : (

                    <Card className="bg-card p-8 text-center">

                        <p className="text-muted-foreground">
                            Thùng rác trống
                        </p>

                    </Card>

                )}

            </div>

            {/* Delete Dialog */}

            <AlertDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >

                <AlertDialogContent>

                    <AlertDialogHeader>

                        <AlertDialogTitle>
                            Xóa vĩnh viễn?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Bài viết sẽ bị xóa vĩnh viễn.
                        </AlertDialogDescription>

                    </AlertDialogHeader>

                    <AlertDialogCancel>
                        Hủy
                    </AlertDialogCancel>

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

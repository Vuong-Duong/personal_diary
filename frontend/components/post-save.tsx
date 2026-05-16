'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PostCard } from './post-card'
import { TopHeader } from './top-header'
import { ToastAction } from '@/components/ui/toast'
import {
    getSavedPosts,
    unsavePost,
} from '@/api/post.api'
import {
    getPostStats,
    likePost,
    unlikePost,
} from '@/api/stats.api'
import {
    createComment as createCommentAPI,
    getPostComments,
} from '@/api/comment.api'

import type { Post as PostType, Comment as CommentType } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/providers/auth-provider'
import { getUserIdFromToken } from '@/api/user.api'

interface PostAuthor {
    id: string
    name: string
    avatar: string
}

interface PostUIData extends PostType {
    author: PostAuthor
    stats: {
        likes: number
        comments: number
    }
    liked: boolean
    comments: CommentType[]
    isSaved?: boolean
}

export function SavePost() {

    const [posts, setPosts] = useState<PostUIData[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const { toast } = useToast()
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()

    const showTopHeader = !authLoading && !user

    const loadPosts = useCallback(async () => {

        try {

            setIsLoading(true)

            const response = await getSavedPosts()
            const postsData = response.posts
            const currentUserId = getUserIdFromToken()

            const postsWithStats = await Promise.all(

                postsData.map(async (post: any) => {

                    try {

                        const statsData = await getPostStats(post.id)
                        const commentsResponse = await getPostComments(post.id)

                        const commentsData = commentsResponse.comments

                        const isAnonPost = !!post.isAnonymous

                        const liked =
                            !!currentUserId &&
                            Array.isArray((statsData as any).likedBy) &&
                            (statsData as any).likedBy.some(
                                (id: string) => id === currentUserId
                            )

                        return {

                            id: post.id,
                            userId: typeof post.userId === 'string'
                                ? post.userId
                                : post.userId?.id || '',

                            title: post.title,
                            content: post.content,
                            visibility: post.visibility,
                            isAnonymous: post.isAnonymous,
                            status: post.status,
                            createdAt: post.createdAt,
                            updatedAt: post.updatedAt,

                            author: {

                                id: typeof post.userId === 'string'
                                    ? post.userId
                                    : post.userId?.id || '',

                                name: isAnonPost
                                    ? 'Ẩn danh'
                                    : (typeof post.userId === 'string'
                                        ? 'Ẩn danh'
                                        : post.userId?.name || 'Ẩn danh'),

                                avatar: isAnonPost
                                    ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=default'
                                    : (typeof post.userId === 'string'
                                        ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=default'
                                        : post.userId?.avatar ||
                                        'https://api.dicebear.com/9.x/avataaars/svg?seed=default'),
                            },

                            stats: {
                                likes: statsData.likes || 0,
                                comments: statsData.comments || 0,
                            },

                            liked,
                            isSaved: true,

                            comments: (commentsData || []).map((comment: any) => {

                                const isAnonComment = !!comment.isAnonymous

                                return {

                                    id: comment.id,
                                    postId: comment.postId,

                                    userId: typeof comment.userId === 'string'
                                        ? comment.userId
                                        : comment.userId?.id || '',

                                    content: comment.content,
                                    isAnonymous: comment.isAnonymous,
                                    createdAt: comment.createdAt,

                                    author: {

                                        name: isAnonComment
                                            ? 'Ẩn danh'
                                            : (typeof comment.userId === 'string'
                                                ? 'Ẩn danh'
                                                : comment.userId?.name || 'Ẩn danh'),

                                        avatar: isAnonComment
                                            ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=default'
                                            : (typeof comment.userId === 'string'
                                                ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=default'
                                                : comment.userId?.avatar ||
                                                'https://api.dicebear.com/9.x/avataaars/svg?seed=default'),
                                    },

                                }

                            }),

                        }

                    } catch (error) {

                        console.error('Error loading post stats:', error)
                        return null

                    }

                })

            )

            setPosts(postsWithStats.filter((p) => p !== null) as PostUIData[])

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

    useEffect(() => {
        loadPosts()
    }, [loadPosts])

    const handleLike = async (postId: string) => {

        if (!user && !authLoading) {

            toast({
                title: 'Yêu cầu đăng nhập',
                description: 'Vui lòng đăng nhập để thích bài viết.',
                action: (
                    <ToastAction altText="Đăng nhập" onClick={() => router.push('/login')}>
                        Đăng nhập
                    </ToastAction>
                ),
            })

            return
        }

        const post = posts.find(p => p.id === postId)
        if (!post) return

        try {

            if (post.liked) {
                await unlikePost(postId)
            } else {
                await likePost(postId)
            }

            setPosts(

                posts.map((p) => {

                    if (p.id === postId) {

                        return {
                            ...p,
                            liked: !p.liked,
                            stats: {
                                ...p.stats,
                                likes: p.liked
                                    ? p.stats.likes - 1
                                    : p.stats.likes + 1,
                            },
                        }

                    }

                    return p

                })

            )

        } catch (error: any) {

            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể thực hiện thao tác',
                variant: 'destructive',
            })

        }

    }

    const handleAddComment = async (postId: string, content: string) => {
        if (!user && !authLoading) {
            toast({
                title: 'Yêu cầu đăng nhập',
                description: 'Vui lòng đăng nhập để bình luận.',
                action: (
                    <ToastAction altText="Đăng nhập" onClick={() => router.push('/login')}>
                        Đăng nhập
                    </ToastAction>
                ),
            })
            return
        }

        try {
            await createCommentAPI({
                postId,
                content,
                isAnonymous: false,
            })

            loadPosts()

            toast({
                title: 'Thành công',
                description: 'Bình luận đã được thêm',
            })
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể thêm bình luận',
                variant: 'destructive',
            })
        }
    }

    const handleSavePost = async (postId: string) => {

        try {

            await unsavePost(postId)

            setPosts(prev => prev.filter(p => p.id !== postId))

            toast({
                title: 'Thành công',
                description: 'Đã bỏ lưu bài viết',
            })

        } catch (error: any) {

            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể bỏ lưu bài viết',
                variant: 'destructive',
            })

        }

    }

    return (

        <div className={`min-h-screen bg-background p-8 ${showTopHeader ? 'pt-24' : ''}`}>

            {showTopHeader && <TopHeader />}

            <div className="mx-auto max-w-2xl">

                <h1 className="text-2xl font-bold mb-6">
                    Bài viết đã lưu
                </h1>

                <div className="space-y-6">

                    {isLoading && (
                        <p className="text-center text-muted-foreground">
                            Đang tải bài viết...
                        </p>
                    )}

                    {!isLoading && posts.length === 0 && (
                        <p className="text-center text-muted-foreground">
                            Bạn chưa lưu bài viết nào
                        </p>
                    )}

                    {posts.map((post) => (

                        <PostCard
                            key={post.id}
                            post={post}
                            onLike={() => handleLike(post.id)}
                            onAddComment={(text) => handleAddComment(post.id, text)}
                            onSave={() => handleSavePost(post.id)}
                            isAuthenticated={!!user}
                            currentUserId={getUserIdFromToken()}
                            isSaved={true}
                        />

                    ))}

                </div>

            </div>

        </div>

    )

}
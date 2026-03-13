'use client'

import { useState, useEffect } from 'react'
import { PostCard } from './post-card'
import { CreatePostModal } from './create-post-modal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
    getAllPosts,
    createPost as createPostAPI,
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
}

export function PostFeed() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [posts, setPosts] = useState<PostUIData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        loadPosts()
    }, [])

    const loadPosts = async () => {
        try {
            setIsLoading(true)
            const response = await getAllPosts()
            const postsData = response.posts

            // Fetch stats for each post
            const postsWithStats = await Promise.all(
                postsData.map(async (post: any) => {
                    try {
                        const statsData = await getPostStats(post.id)

                        const commentsResponse = await getPostComments(post.id)
                        const commentsData = commentsResponse.comments

                        return {
                            id: post.id,
                            userId: typeof post.userId === 'string' ? post.userId : post.userId?.id || '',
                            title: post.title,
                            content: post.content,
                            visibility: post.visibility,
                            isAnonymous: post.isAnonymous,
                            status: post.status,
                            createdAt: post.createdAt,
                            updatedAt: post.updatedAt,
                            author: {
                                id: typeof post.userId === 'string' ? post.userId : post.userId?.id || '',
                                name: typeof post.userId === 'string' ? 'Anonymous' : post.userId?.name || 'Anonymous',
                                avatar: typeof post.userId === 'string' ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=default' : post.userId?.avatar || 'https://api.dicebear.com/9.x/avataaars/svg?seed=default',
                            },
                            stats: {
                                likes: statsData.likes || 0,
                                comments: statsData.comments || 0,
                            },
                            liked: false,
                            comments: (commentsData || []).map((comment: any) => ({
                                id: comment.id,
                                postId: comment.postId,
                                userId: typeof comment.userId === 'string' ? comment.userId : comment.userId?.id || '',
                                content: comment.content,
                                isAnonymous: comment.isAnonymous,
                                createdAt: comment.createdAt,
                                author: {
                                    name: typeof comment.userId === 'string' ? 'Anonymous' : comment.userId?.name || 'Anonymous',
                                    avatar: typeof comment.userId === 'string' ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=default' : comment.userId?.avatar || 'https://api.dicebear.com/9.x/avataaars/svg?seed=default',
                                },
                            })),
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
    }

    const handleCreatePost = async (title: string, content: string, visibility: 'PUBLIC' | 'PRIVATE', isAnonymous: boolean) => {
        try {
            const response = await createPostAPI({
                title,
                content,
                visibility,
                isAnonymous,
                status: 'DRAFT',
            })

            const newPost = response as PostType

            // Create new post UI
            const newPostUI: PostUIData = {
                ...(newPost as any),
                author: {
                    id: newPost.userId,
                    name: 'Anonymous',
                    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=default',
                },
                stats: {
                    likes: 0,
                    comments: 0,
                },
                liked: false,
                comments: [],
            }

            setPosts([newPostUI, ...posts])
            setIsCreateModalOpen(false)

            toast({
                title: 'Thành công',
                description: 'Bài viết đã được tạo thành công',
            })
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể tạo bài viết',
                variant: 'destructive',
            })
        }
    }

    const handleLike = async (postId: string) => {
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
                                likes: p.liked ? p.stats.likes - 1 : p.stats.likes + 1,
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
        try {
            await createCommentAPI({
                postId,
                content,
                isAnonymous: false,
            })

            // Reload posts to get updated comments
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

    return (
        <div className="ml-64 min-h-screen bg-background p-8">
            <div className="mx-auto max-w-2xl">
                {/* Create Post Section */}
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mb-8 w-full gap-2"
                    size="lg"
                    disabled={isLoading}
                >
                    <Plus className="h-5 w-5" />
                    Tạo bài viết
                </Button>

                {/* Posts List */}
                <div className="space-y-6">
                    {isLoading && <p className="text-center text-muted-foreground">Đang tải bài viết...</p>}
                    {!isLoading && posts.length === 0 && (
                        <p className="text-center text-muted-foreground">Chưa có bài viết nào</p>
                    )}
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onLike={() => handleLike(post.id)}
                            onAddComment={(text) => handleAddComment(post.id, text)}
                        />
                    ))}
                </div>
            </div>

            {/* Create Post Modal */}
            <CreatePostModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onCreatePost={handleCreatePost}
            />
        </div>
    )
}

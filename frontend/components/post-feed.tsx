'use client'

import { useState } from 'react'
import { PostCard } from './post-card'
import { CreatePostModal } from './create-post-modal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Comment {
    id: string
    text: string
    author: {
        name: string
        avatar: string
    }
    createdAt: Date
}

interface PostAuthor {
    id: string
    name: string
    avatar: string
}

interface PostStats {
    likes: number
    comments: number
}

interface Post {
    id: string
    userId: string
    title: string
    content: string
    visibility: string
    isAnonymous: boolean
    status: string
    createdAt: Date
    updatedAt: Date
    author: PostAuthor
    stats: PostStats
    liked: boolean
    comments: Comment[]
}

export function PostFeed() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [posts, setPosts] = useState<Post[]>([])

    const handleCreatePost = (title: string, content: string) => {
        const newPost: Post = {
            id: String(posts.length + 1),
            userId: 'current-user',
            title,
            content,
            visibility: 'PUBLIC',
            isAnonymous: false,
            status: 'PUBLISHED',
            createdAt: new Date(),
            updatedAt: new Date(),
            author: {
                id: 'current-user',
                name: 'You',
                avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=You',
            },
            stats: {
                likes: 0,
                comments: 0,
            },
            liked: false,
            comments: [],
        }
        setPosts([newPost, ...posts])
        setIsCreateModalOpen(false)
    }

    const handleLike = (postId: string) => {
        setPosts(
            posts.map((post) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        liked: !post.liked,
                        stats: {
                            ...post.stats,
                            likes: post.liked ? post.stats.likes - 1 : post.stats.likes + 1,
                        },
                    }
                }
                return post
            })
        )
    }

    const handleAddComment = (postId: string, text: string) => {
        setPosts(
            posts.map((post) => {
                if (post.id === postId) {
                    const newComment = {
                        id: String(post.comments.length + 1),
                        text,
                        author: {
                            name: 'You',
                            avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=You',
                        },
                        createdAt: new Date(),
                    }
                    return {
                        ...post,
                        comments: [...post.comments, newComment],
                        stats: {
                            ...post.stats,
                            comments: post.stats.comments + 1,
                        },
                    }
                }
                return post
            })
        )
    }

    return (
        <div className="ml-64 min-h-screen bg-background p-8">
            <div className="mx-auto max-w-2xl">
                {/* Create Post Section */}
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mb-8 w-full gap-2"
                    size="lg"
                >
                    <Plus className="h-5 w-5" />
                    Tạo bài viết
                </Button>

                {/* Posts List */}
                <div className="space-y-6">
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

'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CommentSection } from './comment-section'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PostAuthor {
    id: string
    name: string
    avatar: string
}

interface PostStats {
    likes: number
    comments: number
}

interface Comment {
    id: string
    text: string
    author: {
        name: string
        avatar: string
    }
    createdAt: Date
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

interface PostCardProps {
    post: Post
    onLike: () => void
    onAddComment: (text: string) => void
}

export function PostCard({ post, onLike, onAddComment }: PostCardProps) {
    const [showComments, setShowComments] = useState(false)

    const formatDate = (date: Date) => {
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'vừa xong'
        if (diffMins < 60) return `${diffMins}m trước`
        if (diffHours < 24) return `${diffHours}h trước`
        if (diffDays < 7) return `${diffDays}d trước`
        return date.toLocaleDateString('vi-VN')
    }

    return (
        <Card className="overflow-hidden bg-card">
            {/* Header */}
            <div className="border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-card-foreground">{post.author.name}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(post.createdAt)}</p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Lưu bài viết</DropdownMenuItem>
                        <DropdownMenuItem>Ẩn bài viết</DropdownMenuItem>
                        {post.userId === 'current-user' && (
                            <DropdownMenuItem className="text-destructive">Xóa bài viết</DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Content */}
            <div className="p-4">
                <h2 className="text-lg font-semibold text-card-foreground mb-2">{post.title}</h2>
                <p className="text-card-foreground whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Stats */}
            <div className="border-t border-border px-4 py-3 flex items-center justify-between text-sm text-muted-foreground">
                <span>{post.stats.likes} likes</span>
                <span>{post.stats.comments} comments</span>
            </div>

            {/* Actions */}
            <div className="border-t border-border p-4 flex gap-2">
                <Button
                    variant="ghost"
                    className="flex-1 gap-2 justify-center"
                    onClick={onLike}
                >
                    <Heart
                        className={`h-5 w-5 ${post.liked ? 'fill-destructive text-destructive' : ''}`}
                    />
                    <span className={post.liked ? 'text-destructive' : ''}>Like</span>
                </Button>
                <Button
                    variant="ghost"
                    className="flex-1 gap-2 justify-center"
                    onClick={() => setShowComments(!showComments)}
                >
                    <MessageCircle className="h-5 w-5" />
                    Comment
                </Button>
                <Button variant="ghost" className="flex-1 gap-2 justify-center">
                    <Share2 className="h-5 w-5" />
                    Share
                </Button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <CommentSection
                    comments={post.comments}
                    onAddComment={onAddComment}
                />
            )}
        </Card>
    )
}

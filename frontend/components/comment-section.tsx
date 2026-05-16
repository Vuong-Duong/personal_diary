'use client'

import { useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import type { Comment as CommentType } from '@/types'

interface CommentSectionProps {
    comments: CommentType[]
    onAddComment: (text: string) => void
    isAuthenticated?: boolean
    onRequireLogin?: () => void
}

export function CommentSection({ comments, onAddComment, isAuthenticated = true, onRequireLogin }: CommentSectionProps) {
    const [commentText, setCommentText] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isAuthenticated) {
            onRequireLogin?.()
            return
        }

        if (commentText.trim()) {
            setIsSubmitting(true)
            try {
                onAddComment(commentText)
                setCommentText('')
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
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
        <div className="border-t border-border">
            {/* Comments List */}
            {comments.length > 0 && (
                <div className="px-4 py-4 space-y-4 max-h-96 overflow-y-auto bg-muted/30">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.author?.avatar} alt={comment.author?.name} />
                                <AvatarFallback>{comment.author?.name?.charAt(0) || 'A'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="bg-muted rounded-lg px-3 py-2">
                                    <p className="font-semibold text-sm text-card-foreground">
                                        {comment.author?.name || 'Anonymous'}
                                    </p>
                                    <p className="text-sm text-card-foreground">{comment.content}</p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDate(comment.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Comment Input */}
            <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-4 bg-muted/50">
                <Avatar className="h-8 w-8">
                    <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=You" alt="You" />
                    <AvatarFallback>Y</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                    <Input
                        placeholder="Viết bình luận..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="bg-background"
                        disabled={isSubmitting}
                    />
                    <Button
                        type="submit"
                        size="sm"
                        variant={commentText.trim() ? 'default' : 'ghost'}
                        disabled={!commentText.trim() || isSubmitting}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    )
}

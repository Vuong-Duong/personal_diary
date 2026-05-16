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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Post as PostType, Comment as CommentType } from '@/types'

interface PostAuthor {
    id: string
    name: string
    avatar: string
}

interface PostStats {
    likes: number
    comments: number
}

interface PostUIData extends PostType {
    author: PostAuthor
    stats: PostStats
    liked: boolean
    comments: CommentType[]
}

interface PostCardProps {
    post: PostUIData
    onLike: () => void
    onAddComment: (text: string) => void
    onToggleVisibility?: () => void
    onDelete?: () => void
    isAuthenticated?: boolean
    onRequireLogin?: () => void
    currentUserId?: string | null
    onSave?: () => void
    isSaved?: boolean
}

export function PostCard({
    post,
    onLike,
    onAddComment,
    onToggleVisibility,
    onDelete,
    isAuthenticated = true,
    onRequireLogin,
    currentUserId,
    onSave,
    isSaved = false,
}: PostCardProps) {

    const [showComments, setShowComments] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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

    const isOwner = currentUserId === post.userId

    const handleSave = () => {
        if (!isAuthenticated) {
            onRequireLogin?.()
            return
        }

        onSave?.()
    }

    return (
        <Card className="overflow-hidden bg-card">

            {/* Header */}
            <div className="border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">

                    <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                        <AvatarFallback>
                            {post.author.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <p className="font-semibold text-card-foreground">
                            {post.author.name}
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {formatDate(post.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Dropdown */}
                <DropdownMenu>

                    <DropdownMenuTrigger
                        className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-accent"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">

                        {/* Nếu là chủ bài viết */}
                        {isOwner ? (
                            <>
                                <DropdownMenuItem
                                    onClick={onToggleVisibility}
                                >
                                    {post.visibility === 'PUBLIC'
                                        ? 'Ẩn bài viết'
                                        : 'Hiển thị công khai'}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    Xóa bài viết
                                </DropdownMenuItem>
                            </>
                        ) : (

                            /* Người khác */
                            <DropdownMenuItem onClick={handleSave}>
                                {isSaved
                                    ? 'Bỏ lưu bài viết'
                                    : 'Lưu bài viết'}
                            </DropdownMenuItem>

                        )}

                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Content */}
            <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">
                    {post.title}
                </h2>

                <p className="whitespace-pre-wrap">
                    {post.content}
                </p>
            </div>

            {/* Stats */}
            <div className="border-t px-4 py-3 flex justify-between text-sm text-muted-foreground">
                <span>{post.stats.likes} lượt thích</span>
                <span>{post.stats.comments} bình luận</span>
            </div>

            {/* Actions */}
            <div className="border-t p-4 flex gap-2">

                <Button
                    variant="ghost"
                    className="flex-1 gap-2 justify-center"
                    onClick={onLike}
                >
                    <Heart
                        className={`h-5 w-5 ${post.liked
                            ? 'fill-destructive text-destructive'
                            : ''
                            }`}
                    />

                    <span
                        className={
                            post.liked ? 'text-destructive' : ''
                        }
                    >
                        Thích
                    </span>
                </Button>

                <Button
                    variant="ghost"
                    className="flex-1 gap-2 justify-center"
                    onClick={() => setShowComments(!showComments)}
                >
                    <MessageCircle className="h-5 w-5" />
                    Bình luận
                </Button>

                <Button
                    variant="ghost"
                    className="flex-1 gap-2 justify-center"
                >
                    <Share2 className="h-5 w-5" />
                    Chia sẻ
                </Button>

            </div>

            {/* Comments */}
            {showComments && (
                <CommentSection
                    comments={post.comments}
                    onAddComment={onAddComment}
                    isAuthenticated={isAuthenticated}
                    onRequireLogin={onRequireLogin}
                />
            )}

            {/* Delete Dialog */}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>

                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Chuyển vào thùng rác?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            Bài viết sẽ được chuyển vào thùng rác và tự động xóa sau 30 ngày.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>

                        <AlertDialogCancel>
                            Hủy
                        </AlertDialogCancel>

                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground"
                            onClick={() => {
                                onDelete?.()
                                setIsDeleteDialogOpen(false)
                            }}
                        >
                            Xóa
                        </AlertDialogAction>

                    </AlertDialogFooter>

                </AlertDialogContent>
            </AlertDialog>

        </Card>
    )
}
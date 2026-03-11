'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface CreatePostModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreatePost: (title: string, content: string) => void
}

export function CreatePostModal({
    open,
    onOpenChange,
    onCreatePost,
}: CreatePostModalProps) {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (title.trim() && content.trim()) {
            setIsSubmitting(true)
            try {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 500))
                onCreatePost(title, content)
                setTitle('')
                setContent('')
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Tạo bài viết mới</DialogTitle>
                    <DialogDescription>
                        Chia sẻ suy nghĩ, cảm nhận của bạn với cộng đồng
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Tiêu đề</Label>
                        <Input
                            id="title"
                            placeholder="Tiêu đề bài viết"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="content">Nội dung</Label>
                        <Textarea
                            id="content"
                            placeholder="Viết nội dung bài viết..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="mt-1 min-h-[150px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title.trim() || !content.trim() || isSubmitting}
                        >
                            {isSubmitting ? 'Đang tạo...' : 'Đăng bài'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

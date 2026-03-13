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
import { Lock, Globe, Eye, EyeOff } from 'lucide-react'

interface CreatePostModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreatePost: (title: string, content: string, visibility: 'PUBLIC' | 'PRIVATE', isAnonymous: boolean) => void
}

export function CreatePostModal({
    open,
    onOpenChange,
    onCreatePost,
}: CreatePostModalProps) {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC')
    const [isAnonymous, setIsAnonymous] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (title.trim() && content.trim()) {
            setIsSubmitting(true)
            try {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 500))
                onCreatePost(title, content, visibility, isAnonymous)
                setTitle('')
                setContent('')
                setVisibility('PUBLIC')
                setIsAnonymous(false)
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

                <form onSubmit={handleSubmit} className="space-y-5">
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

                    {/* Visibility Section */}
                    <div className="border-t pt-4">
                        <Label className="text-base font-semibold mb-3 block">Ai có thể xem?</Label>
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setVisibility('PUBLIC')}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${visibility === 'PUBLIC'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                                    }`}
                            >
                                <Globe className={`w-5 h-5 ${visibility === 'PUBLIC' ? 'text-primary' : 'text-neutral-600 dark:text-neutral-400'}`} />
                                <div className="text-left flex-1">
                                    <p className="font-medium text-sm">Công khai</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Tất cả mọi người có thể xem</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setVisibility('PRIVATE')}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${visibility === 'PRIVATE'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                                    }`}
                            >
                                <Lock className={`w-5 h-5 ${visibility === 'PRIVATE' ? 'text-primary' : 'text-neutral-600 dark:text-neutral-400'}`} />
                                <div className="text-left flex-1">
                                    <p className="font-medium text-sm">Riêng tư</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Chỉ bạn có thể xem</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Anonymous Section */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <Label className="text-base font-semibold">Đăng ẩn danh</Label>

                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAnonymous(!isAnonymous)}
                                className={`flex items-center justify-center gap-2 w-[120px] h-[40px] rounded-lg border-2 transition-all font-medium text-sm ${isAnonymous
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                                    }`}
                            >
                                {isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                {isAnonymous ? 'Ẩn danh' : 'Bình thường'}
                            </button>
                        </div>
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

'use client'

import { useState, useEffect } from 'react'
import { Edit2, Heart, MessageCircle, Lock, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getProfile, updateUser, getUserActivityStats } from '@/api/user.api'
import { getUserPosts } from '@/api/post.api'
import type { User } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { ChangePasswordModal } from './change-password-modal'

interface UserWithStats extends User {
    stats?: {
        posts: number
        totalLikesReceived: number
        totalCommentsReceived: number
        totalPrivatePosts: number
    }
}

export function UserProfile() {
    const [user, setUser] = useState<UserWithStats | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
    })
    const { toast } = useToast()

    useEffect(() => {
        loadUserProfile()
    }, [])

    const loadUserProfile = async () => {
        try {
            setIsLoading(true)
            const userData = await getProfile()

            // Try to get user posts count & activity stats
            let postsCount = 0
            let activityStats = {
                totalLikesReceived: 0,
                totalCommentsReceived: 0,
                totalPrivatePosts: 0,
            }
            try {
                const postsResponse = await getUserPosts(userData.id)
                postsCount = (postsResponse.posts || []).length
                activityStats = await getUserActivityStats()
            } catch (error) {
                console.warn('Could not fetch user stats')
            }

            const userWithStats: UserWithStats = {
                ...userData,
                stats: {
                    posts: postsCount,
                    totalLikesReceived: activityStats.totalLikesReceived,
                    totalCommentsReceived: activityStats.totalCommentsReceived,
                    totalPrivatePosts: activityStats.totalPrivatePosts,
                },
            }

            setUser(userWithStats)
            setFormData({
                name: userWithStats.name,
            })
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể tải hồ sơ',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        try {
            setIsSaving(true)
            await updateUser(user.id, {
                name: formData.name,
            })

            setUser({
                ...user,
                name: formData.name,
            })
            setIsEditModalOpen(false)

            toast({
                title: 'Thành công',
                description: 'Hồ sơ đã được cập nhật',
            })
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể cập nhật hồ sơ',
                variant: 'destructive',
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleFormChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    if (isLoading) {
        return (
            <div className="ml-64 min-h-screen bg-background p-8 flex items-center justify-center">
                <p className="text-muted-foreground">Đang tải hồ sơ...</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="ml-64 min-h-screen bg-background p-8 flex items-center justify-center">
                <p className="text-muted-foreground">Không thể tải hồ sơ</p>
            </div>
        )
    }

    return (
        <div className="ml-64 min-h-screen bg-background p-8">
            <div className="mx-auto max-w-2xl">
                {/* Profile Card */}
                <Card className="bg-card overflow-hidden mb-8">
                    {/* Header Background */}
                    <div className="h-32 bg-gradient-to-r from-primary via-accent to-primary opacity-90"></div>

                    {/* Profile Info */}
                    <div className="relative px-6 pb-6">
                        {/* Avatar */}
                        <div className="flex items-start justify-between gap-4 -mt-16 mb-6">
                            <Avatar className="h-32 w-32 border-4 border-card">
                                <AvatarImage src={user.avatar || ''} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={() => {
                                        setFormData({ name: user.name })
                                        setIsEditModalOpen(true)
                                    }}
                                    className="gap-2"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Chỉnh sửa hồ sơ
                                </Button>

                            </div>
                        </div>

                        {/* User Info */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-card-foreground">{user.name}</h1>
                            <p className="text-muted-foreground">{user.email}</p>
                            <div className="mb-6 flex justify-end">
                                <Button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <KeyRound className="h-4 w-4" />
                                    Đổi mật khẩu
                                </Button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-card-foreground">
                                    {user.stats?.posts ?? 0}
                                </p>
                                <p className="text-sm text-muted-foreground">Bài viết</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-card-foreground">
                                    {user.stats?.totalLikesReceived ?? 0}
                                </p>
                                <p className="text-sm text-muted-foreground">Lượt thích nhận được</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-card-foreground">
                                    {user.stats?.totalCommentsReceived ?? 0}
                                </p>
                                <p className="text-sm text-muted-foreground">Bình luận nhận được</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* User Posts Summary */}
                <div className="grid grid-cols-1 gap-4">
                    <Card className="bg-card p-6">
                        <h2 className="text-lg font-semibold text-card-foreground mb-4">
                            Thống kê hoạt động
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Heart className="h-5 w-5 text-primary" />
                                    <span className="text-card-foreground">Tổng lượt thích nhận được</span>
                                </div>
                                <span className="font-semibold text-card-foreground">
                                    {user.stats?.totalLikesReceived ?? 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                    <MessageCircle className="h-5 w-5 text-accent" />
                                    <span className="text-card-foreground">Tổng bình luận nhận được</span>
                                </div>
                                <span className="font-semibold text-card-foreground">
                                    {user.stats?.totalCommentsReceived ?? 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-card-foreground">Bài viết riêng tư</span>
                                </div>
                                <span className="font-semibold text-card-foreground">
                                    {user.stats?.totalPrivatePosts ?? 0}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin hồ sơ của bạn
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Tên</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleFormChange('name', e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                disabled={isSaving}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <ChangePasswordModal
                open={isPasswordModalOpen}
                onOpenChange={setIsPasswordModalOpen}
            />
        </div>
    )
}


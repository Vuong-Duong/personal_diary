'use client'

import { useState } from 'react'
import { Edit2, Heart, MessageCircle, Lock } from 'lucide-react'
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

interface UserData {
    id: string
    name: string
    email: string
    bio: string
    avatar: string
    stats: {
        posts: number
        followers: number
        following: number
    }
}

const MOCK_USER: UserData = {
    id: 'current-user',
    name: 'Your Name',
    email: 'you@example.com',
    bio: 'Lover of coding, coffee, and good conversations. ☕️✨',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=You',
    stats: {
        posts: 12,
        followers: 234,
        following: 156,
    },
}

export function UserProfile() {
    const [user, setUser] = useState<UserData>(MOCK_USER)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: user.name,
        bio: user.bio,
    })

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setUser({
            ...user,
            name: formData.name,
            bio: formData.bio,
        })
        setIsEditModalOpen(false)
    }

    const handleFormChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
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
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <Button
                                onClick={() => {
                                    setFormData({ name: user.name, bio: user.bio })
                                    setIsEditModalOpen(true)
                                }}
                                className="gap-2"
                            >
                                <Edit2 className="h-4 w-4" />
                                Chỉnh sửa hồ sơ
                            </Button>
                        </div>

                        {/* User Info */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-card-foreground">{user.name}</h1>
                            <p className="text-muted-foreground">{user.email}</p>
                            <p className="text-card-foreground mt-3">{user.bio}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-card-foreground">
                                    {user.stats.posts}
                                </p>
                                <p className="text-sm text-muted-foreground">Bài viết</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-card-foreground">
                                    {user.stats.followers}
                                </p>
                                <p className="text-sm text-muted-foreground">Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-card-foreground">
                                    {user.stats.following}
                                </p>
                                <p className="text-sm text-muted-foreground">Đang theo dõi</p>
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
                                <span className="font-semibold text-card-foreground">1,248</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                    <MessageCircle className="h-5 w-5 text-accent" />
                                    <span className="text-card-foreground">Tổng bình luận nhận được</span>
                                </div>
                                <span className="font-semibold text-card-foreground">324</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-card-foreground">Bài viết riêng tư</span>
                                </div>
                                <span className="font-semibold text-card-foreground">5</span>
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

                        <div>
                            <Label htmlFor="bio">Tiểu sử</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => handleFormChange('bio', e.target.value)}
                                className="mt-1 min-h-[100px]"
                                placeholder="Nói gì đó về bạn..."
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Hủy
                            </Button>
                            <Button type="submit">Lưu thay đổi</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

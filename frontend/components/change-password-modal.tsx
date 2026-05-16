'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { changePassword } from '@/api/user.api'
import { useToast } from '@/hooks/use-toast'

interface ChangePasswordModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ChangePasswordModal({
    open,
    onOpenChange,
}: ChangePasswordModalProps) {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('Vui lòng điền đầy đủ tất cả các trường')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu mới không khớp')
            return
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự')
            return
        }

        setIsSubmitting(true)
        try {
            await changePassword({
                oldPassword: currentPassword,
                newPassword,
            })

            // Reset form
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            onOpenChange(false)

            toast({
                title: 'Thành công',
                description: 'Mật khẩu đã được thay đổi',
            })
        } catch (err: any) {
            const message =
                err?.message ||
                (err?.response && err.response.data && err.response.data.message) ||
                'Có lỗi xảy ra, vui lòng thử lại'
            setError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const PasswordInput = ({
        id,
        label,
        value,
        onChange,
        showPassword,
        onToggleShow,
    }: {
        id: string
        label: string
        value: string
        onChange: (value: string) => void
        showPassword: boolean
        onToggleShow: () => void
    }) => (
        <div>
            <Label htmlFor={id}>{label}</Label>
            <div className="relative mt-1">
                <Input
                    id={id}
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                />
                <button
                    type="button"
                    onClick={onToggleShow}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                    {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                    ) : (
                        <Eye className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Đổi mật khẩu</DialogTitle>
                    <DialogDescription>
                        Nhập mật khẩu hiện tại và mật khẩu mới để đổi mật khẩu
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <PasswordInput
                        id="current-password"
                        label="Mật khẩu hiện tại"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        showPassword={showCurrentPassword}
                        onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
                    />

                    <PasswordInput
                        id="new-password"
                        label="Mật khẩu mới"
                        value={newPassword}
                        onChange={setNewPassword}
                        showPassword={showNewPassword}
                        onToggleShow={() => setShowNewPassword(!showNewPassword)}
                    />

                    <PasswordInput
                        id="confirm-password"
                        label="Xác nhận mật khẩu mới"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        showPassword={showConfirmPassword}
                        onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                    />

                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                            {error}
                        </div>
                    )}

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
                            disabled={isSubmitting}
                            className="gap-2"
                        >
                            {isSubmitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

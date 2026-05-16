'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth-provider'
import { LogOut } from 'lucide-react'

export function TopHeader() {
    const { user, logout } = useAuth()

    return (
        <header className="fixed top-0 right-0 left-0 h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-6 flex items-center justify-between z-40">
            <div className="flex-1" />

            {/* Auth Links */}
            <div className="flex items-center gap-3">
                {user ? (
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-700 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all duration-200 border border-neutral-300 dark:border-neutral-700"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                    </button>
                ) : (
                    <>
                        <Link href="/login">
                            <Button
                                variant="outline"
                                className="border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white"
                            >
                                Đăng nhập
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button
                                className="bg-primary hover:bg-primary/90 text-white border border-primary"
                            >
                                Đăng kí
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </header>
    )
}

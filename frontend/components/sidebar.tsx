'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Lock, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Sidebar() {
    const pathname = usePathname()

    const navItems = [
        {
            name: 'Feed',
            href: '/',
            icon: Home,
        },
        {
            name: 'Private',
            href: '/private',
            icon: Lock,
        },
        {
            name: 'Profile',
            href: '/profile',
            icon: User,
        },
    ]

    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/'
        }
        return pathname.startsWith(href)
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-sidebar p-6 flex flex-col">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-2xl font-bold text-sidebar-foreground">Share.</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-3">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)

                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={active ? 'default' : 'ghost'}
                                className="w-full justify-start gap-3 text-base"
                            >
                                <Icon className="h-5 w-5" />
                                {item.name}
                            </Button>
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-base text-destructive hover:text-destructive hover:bg-destructive/10"
            >
                <LogOut className="h-5 w-5" />
                Logout
            </Button>
        </aside>
    )
}

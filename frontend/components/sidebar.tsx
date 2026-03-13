'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Lock, User, LogOut, BookOpen } from 'lucide-react'

export function Sidebar() {
    const pathname = usePathname()

    const navItems = [
        {
            name: 'Home',
            href: '/',
            icon: Home,
        },
        {
            name: 'Private',
            href: '/diaryPrivate',
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
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-6 flex flex-col">
            {/* Logo Header */}
            <div className="mb-8 px-2">
                <BookOpen className="w-7 h-7 text-neutral-900 dark:text-white" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)

                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${active
                                    ? 'bg-neutral-100 dark:bg-neutral-900'
                                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                                    }`}
                            >
                                <Icon
                                    className={`w-6 h-6 transition-colors ${active
                                        ? 'text-neutral-900 dark:text-white font-bold'
                                        : 'text-neutral-700 dark:text-neutral-400'
                                        }`}
                                />
                                <span
                                    className={`text-base transition-colors ${active
                                        ? 'font-semibold text-neutral-900 dark:text-white'
                                        : 'font-normal text-neutral-700 dark:text-neutral-400'
                                        }`}
                                >
                                    {item.name}
                                </span>
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* Logout Button */}
            <button className="flex items-center gap-4 px-4 py-3 rounded-lg text-neutral-700 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all duration-200 w-full text-base">
                <LogOut className="w-6 h-6" />
                <span className="font-normal">Logout</span>
            </button>
        </aside>
    )
}

'use client'

import { useAuth } from '@/providers/auth-provider'
import { Sidebar } from '@/components/sidebar'
import { PostFeed } from '@/components/post-feed'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const hasSidebar = !isLoading && !!user

  return (
    <div className="flex min-h-screen bg-background">
      {hasSidebar && <Sidebar />}
      <main className={`flex-1 ${hasSidebar ? 'ml-64' : ''}`}>
        <PostFeed />
      </main>
    </div>
  )
}

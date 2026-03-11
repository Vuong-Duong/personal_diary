import { Sidebar } from '@/components/sidebar'
import { PostFeed } from '@/components/post-feed'

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1">
        <PostFeed />
      </main>
    </div>
  )
}

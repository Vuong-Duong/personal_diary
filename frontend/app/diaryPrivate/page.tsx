import { Sidebar } from '@/components/sidebar'
import { PrivatePosts } from '@/components/private-posts'

export default function PrivatePage() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1">
                <PrivatePosts />
            </main>
        </div>
    )
}

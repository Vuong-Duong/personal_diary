import { Sidebar } from '@/components/sidebar'
import { PostHistory } from '@/components/post-history'

export default function ProfilePage() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1">
                <PostHistory />
            </main>
        </div>
    )
}

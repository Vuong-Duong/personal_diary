import { Sidebar } from '@/components/sidebar'
import { SavePost } from '@/components/post-save'

export default function ProfilePage() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1">
                <SavePost />
            </main>
        </div>
    )
}

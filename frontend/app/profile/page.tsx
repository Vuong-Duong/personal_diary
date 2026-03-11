import { Sidebar } from '@/components/sidebar'
import { UserProfile } from '@/components/user-profile'

export default function ProfilePage() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1">
                <UserProfile />
            </main>
        </div>
    )
}

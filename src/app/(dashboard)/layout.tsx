import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <div className="md:pl-60">
        <Header />
        <main id="main" className="mx-auto max-w-6xl p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

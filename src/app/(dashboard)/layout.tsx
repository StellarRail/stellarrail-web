import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main id="main" className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}

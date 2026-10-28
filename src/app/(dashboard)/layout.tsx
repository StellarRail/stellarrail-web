import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="min-h-[100dvh] bg-canvas transition-colors duration-150 dark:bg-navy-950">
      <Sidebar />
      <div className="md:pl-64 flex flex-col min-h-[100dvh]">
        <Header />
        <main id="main" className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

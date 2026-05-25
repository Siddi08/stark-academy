import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { InstallPrompt } from '@/components/ui/InstallPrompt'
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

function ShellInner() {
  const [helpOpen, setHelpOpen] = useState(false)
  useKeyboardShortcuts({ onToggleHelp: () => setHelpOpen(v => !v) })

  return (
    <div className="min-h-screen bg-void text-ink">
      {/* ── Desktop sidebar (≥1024px) ── */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 w-[260px] z-20">
        <Sidebar />
      </div>

      {/* ── Main content ── */}
      <main className="lg:ml-[260px] min-h-screen pb-20 lg:pb-0" id="main-content">
        <Outlet />
      </main>

      {/* ── Mobile bottom nav (<1024px) ── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-20">
        <BottomNav />
      </div>

      {/* ── Global overlays ── */}
      <ToastContainer />
      <InstallPrompt />
      {helpOpen && <KeyboardShortcutsHelp onClose={() => setHelpOpen(false)} />}
    </div>
  )
}

export function AppShell() {
  return <ShellInner />
}

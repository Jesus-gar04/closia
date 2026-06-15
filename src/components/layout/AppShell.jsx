import { useState, useEffect } from 'react'
import { Sidebar, MobileTabBar } from './Sidebar'
import { TopBar } from './TopBar'
import { UploadModal } from '../upload/UploadModal'
import { Toaster } from 'react-hot-toast'
import { useWardrobeStore } from '../../store/wardrobeStore'
import { useOutfitsStore } from '../../store/outfitsStore'
import { useCalendarStore } from '../../store/calendarStore'

export function AppShell({ children }) {
  const [isMobile, setIsMobile] = useState(false)

  // Sincroniza desde Supabase al abrir la app (todos los dispositivos comparten datos).
  useEffect(() => {
    useWardrobeStore.getState().hidratar()
    useOutfitsStore.getState().hidratar()
    useCalendarStore.getState().hidratar()
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 760)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-canvas text-ink">
      <TopBar isMobile={isMobile} />

      <div className="flex flex-1 overflow-hidden">
        {!isMobile && <Sidebar />}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>

      {isMobile && <MobileTabBar />}

      <UploadModal />

      <Toaster
        position={isMobile ? 'top-center' : 'bottom-right'}
        toastOptions={{
          style: {
            background: 'var(--bg-surface)',
            color: 'var(--ink)',
            border: '1px solid var(--hairline)',
            borderRadius: '14px',
            fontSize: '13px',
            fontFamily: 'var(--font-body)',
            boxShadow: 'var(--shadow-md)',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: 'var(--sage)', secondary: '#fff' } },
          error:   { iconTheme: { primary: 'var(--danger)', secondary: '#fff' } },
        }}
      />
    </div>
  )
}

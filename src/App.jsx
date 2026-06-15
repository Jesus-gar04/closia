import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AvatarPage }    from './pages/AvatarPage'
import { WardrobePage }  from './pages/WardrobePage'
import { OutfitsPage }   from './pages/OutfitsPage'
import { CalendarPage }  from './pages/CalendarPage'
import { SettingsPage }  from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/"            element={<Navigate to="/avatar" replace />} />
          <Route path="/avatar"      element={<AvatarPage />} />
          <Route path="/guardarropa" element={<WardrobePage />} />
          <Route path="/outfits"     element={<OutfitsPage />} />
          <Route path="/calendario"  element={<CalendarPage />} />
          <Route path="/ajustes"     element={<SettingsPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ConceptPage } from './pages/ConceptPage'
import { LandingPage } from './pages/LandingPage'
import { ReferencesPage } from './pages/ReferencesPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="learn/:slug" element={<ConceptPage />} />
          <Route path="references" element={<ReferencesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

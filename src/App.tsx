import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RequireAuth } from './components/RequireAuth'
import { Landing } from './pages/Landing'
import { SignIn } from './pages/SignIn'
import { About } from './pages/About'
import { FAQ } from './pages/FAQ'
import { Contact } from './pages/Contact'
import { AuthCallback } from './pages/AuthCallback'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { TaskNew } from './pages/TaskNew'
import { TaskDetail } from './pages/TaskDetail'
import { ProfessionalDetail } from './pages/ProfessionalDetail'
import { Activity } from './pages/Activity'
import { Profile } from './pages/Profile'
import { Leaderboard } from './pages/Leaderboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={<Onboarding />} />

        <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/tasks/new" element={<RequireAuth><TaskNew /></RequireAuth>} />
        <Route path="/tasks/:id" element={<RequireAuth><TaskDetail /></RequireAuth>} />
        <Route path="/professionals/:id" element={<RequireAuth><ProfessionalDetail /></RequireAuth>} />
        <Route path="/activity" element={<RequireAuth><Activity /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/leaderboard" element={<RequireAuth><Leaderboard /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}

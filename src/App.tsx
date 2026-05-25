import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import HomeScreen       from '@/screens/Home'
import CurriculumScreen from '@/screens/Curriculum'
import ModuleScreen     from '@/screens/Module'
import LessonScreen     from '@/screens/Lesson'
import QuizScreen       from '@/screens/Quiz'
import ProjectsScreen   from '@/screens/Projects'
import ProgressScreen   from '@/screens/Progress'
import SettingsScreen   from '@/screens/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index           element={<HomeScreen />} />
          <Route path="curriculum" element={<CurriculumScreen />} />
          <Route path="module/:id" element={<ModuleScreen />} />
          <Route path="lesson/:id" element={<LessonScreen />} />
          <Route path="quiz/:id"   element={<QuizScreen />} />
          <Route path="projects"   element={<ProjectsScreen />} />
          <Route path="progress"   element={<ProgressScreen />} />
          <Route path="settings"   element={<SettingsScreen />} />
          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <p className="font-heading text-5xl font-bold text-border mb-4">404</p>
                  <p className="text-dim">Page not found.</p>
                  <a href="/" className="btn-ghost mt-4 inline-flex">Go home</a>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

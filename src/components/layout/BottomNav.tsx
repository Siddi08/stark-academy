import { NavLink } from 'react-router-dom'
import { Home, BookOpen, FlaskConical, BarChart2, Settings, Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'

const NAV = [
  { to: '/',           icon: Home,        label: 'Home' },
  { to: '/curriculum', icon: BookOpen,    label: 'Learn' },
  { to: '/projects',   icon: FlaskConical, label: 'Build' },
  { to: '/ai',         icon: Sparkles,    label: 'Advisor' },
  { to: '/progress',   icon: BarChart2,   label: 'Progress' },
  { to: '/settings',   icon: Settings,    label: 'Settings' },
] as const

export function BottomNav() {
  return (
    <nav className="bg-void/95 backdrop-blur-md border-t border-border safe-pb">
      <div className="flex items-stretch justify-around">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 py-2 px-3 flex-1',
                'min-h-[56px] transition-colors duration-150',
                isActive ? 'text-spark-400' : 'text-ghost',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="font-heading text-[10px] tracking-wide uppercase">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

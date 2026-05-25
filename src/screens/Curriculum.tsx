import { ArcMap } from '@/components/curriculum/ArcMap'

export default function CurriculumScreen() {
  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-ink">Curriculum</h1>
        <p className="text-sm text-dim mt-1">26 modules across 5 arcs. Start where you left off.</p>
      </div>
      <ArcMap />
    </div>
  )
}

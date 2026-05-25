import { useState } from 'react'
import { ExternalLink, GitFork, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/utils/cn'
import { allModules } from '@/data/curriculum'
import { useAppStore, useProgress } from '@/store/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { verifyRepo } from '@/api/github'
import { Badge } from '@/components/ui/Badge'
import type { GithubVerifyResult, Project } from '@/types'

// ─── Status config ────────────────────────────────────────────────────────────

const statusLabel: Record<Project['status'], string> = {
  not_started: 'Not Started',
  in_progress:  'In Progress',
  submitted:    'Submitted',
  verified:     'Verified ✓',
}
const statusBadge: Record<Project['status'], 'dim' | 'spark' | 'warn' | 'ok'> = {
  not_started: 'dim',
  in_progress:  'spark',
  submitted:    'warn',
  verified:     'ok',
}

// ─── Project card ─────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project
  moduleTitle: string
  moduleNumber: number
}

function ProjectCard({ project, moduleTitle, moduleNumber }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [repoInput, setRepoInput] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<GithubVerifyResult | null>(null)

  const { apiKey, githubToken } = useAppStore(useShallow(s => ({
    apiKey: s.apiKey,
    githubToken: s.githubToken,
  })))
  const { updateProjectStatus, setProjectRepo, progress, addToast } = useAppStore(useShallow(s => ({
    updateProjectStatus: s.updateProjectStatus,
    setProjectRepo: s.setProjectRepo,
    progress: s.progress,
    addToast: s.addToast,
  })))

  const status = progress.projectStatuses[project.id] ?? 'not_started'
  const savedRepo = progress.projectRepos[project.id] ?? ''

  async function handleVerify() {
    const url = repoInput.trim() || savedRepo
    if (!url) { addToast({ variant: 'error', title: 'Enter a GitHub URL first' }); return }
    if (!apiKey) { addToast({ variant: 'error', title: 'API key required for verification', body: 'Add your Anthropic API key in Settings.' }); return }

    setVerifying(true)
    setVerifyResult(null)

    try {
      const result = await verifyRepo({
        apiKey,
        repoUrl: url,
        projectName: project.name,
        rubric: project.rubric,
        githubToken: githubToken || undefined,
      })

      setVerifyResult(result)
      setProjectRepo(project.id, url)

      if (result.verified) {
        updateProjectStatus(project.id, 'verified')
        addToast({
          variant: 'success',
          title: `${project.emoji} Project Verified!`,
          body: `+${project.xpReward} XP awarded`,
          emoji: project.emoji,
        })
      } else {
        updateProjectStatus(project.id, 'submitted')
        addToast({ variant: 'error', title: 'Verification failed', body: result.feedback })
      }
    } catch (err) {
      addToast({
        variant: 'error',
        title: 'Verification error',
        body: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setVerifying(false)
    }
  }

  function handleMarkInProgress() {
    updateProjectStatus(project.id, 'in_progress')
    addToast({ variant: 'info', title: `${project.emoji} Project started` })
  }

  return (
    <div className={cn(
      'card transition-all duration-200',
      status === 'verified' && 'border-ok/25',
      status === 'in_progress' && 'border-spark-500/20',
    )}>
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 p-4 min-h-[64px] text-left"
      >
        <span className="text-3xl shrink-0">{project.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="font-heading text-sm text-ink">{project.name}</p>
            <Badge variant={statusBadge[status]} size="sm">{statusLabel[status]}</Badge>
          </div>
          <p className="text-xs text-ghost">M{moduleNumber} · {moduleTitle} · {project.xpReward} XP</p>
        </div>
        {expanded
          ? <ChevronUp size={16} className="text-ghost shrink-0" />
          : <ChevronDown size={16} className="text-ghost shrink-0" />
        }
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-5 border-t border-border pt-4 space-y-4 animate-fade-in">
          {/* Description */}
          <p className="text-sm text-dim leading-relaxed">{project.description}</p>

          {/* Tools */}
          <div>
            <p className="font-heading text-xs text-ghost uppercase tracking-wide mb-2">Tools</p>
            <div className="flex flex-wrap gap-1.5">
              {project.tools.map(t => (
                <span key={t} className="font-mono text-xs bg-raised border border-border px-2 py-0.5 rounded text-dim">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Rubric */}
          <div>
            <p className="font-heading text-xs text-ghost uppercase tracking-wide mb-2">Rubric</p>
            <ul className="space-y-1.5">
              {project.rubric.map((item, i) => {
                const itemPassed = verifyResult?.checkedItems?.[i]?.passed
                return (
                  <li key={i} className="flex items-start gap-2 text-xs text-dim">
                    <span className={cn(
                      'shrink-0 mt-0.5 font-mono',
                      itemPassed === true  ? 'text-ok' :
                      itemPassed === false ? 'text-fail' : 'text-ghost',
                    )}>
                      {itemPassed === true ? '✓' : itemPassed === false ? '✕' : `${i + 1}.`}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Verify result feedback */}
          {verifyResult && (
            <div className={cn(
              'p-3 rounded-xl border text-xs leading-relaxed',
              verifyResult.verified
                ? 'bg-ok/5 border-ok/20 text-ok'
                : 'bg-fail/5 border-fail/20 text-fail',
            )}>
              <span className="font-heading font-bold mr-1">
                {verifyResult.score}% — {verifyResult.verified ? 'Verified' : 'Not verified'}:
              </span>
              {verifyResult.feedback}
            </div>
          )}

          {/* Actions */}
          {status === 'not_started' && (
            <button onClick={handleMarkInProgress} className="btn-secondary w-full">
              Start Project
            </button>
          )}

          {(status === 'in_progress' || status === 'submitted') && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={repoInput || savedRepo}
                  onChange={e => setRepoInput(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="input flex-1 text-sm"
                />
                {(repoInput || savedRepo) && (
                  <a
                    href={repoInput || savedRepo}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost px-3 min-h-[44px]"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              <button
                onClick={handleVerify}
                disabled={verifying || (!repoInput && !savedRepo)}
                className="btn-primary w-full gap-2"
              >
                {verifying
                  ? <><Loader2 size={14} className="animate-spin" /> Verifying…</>
                  : <><GitFork size={14} /> Verify on GitHub</>
                }
              </button>
            </div>
          )}

          {status === 'verified' && savedRepo && (
            <a
              href={savedRepo}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost w-full gap-2 justify-center text-ok border-ok/30"
            >
              <CheckCircle size={14} />
              View on GitHub
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Projects screen ──────────────────────────────────────────────────────────

export default function ProjectsScreen() {
  const progress = useProgress()

  const verifiedCount = Object.values(progress.projectStatuses).filter(s => s === 'verified').length
  const inProgressCount = Object.values(progress.projectStatuses).filter(
    s => s === 'in_progress' || s === 'submitted',
  ).length
  const totalXP = allModules.reduce((n, m) => n + m.project.xpReward, 0)

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-ink">Projects</h1>
        <p className="text-sm text-dim mt-1">
          {verifiedCount}/26 verified · {inProgressCount} in progress · {totalXP.toLocaleString()} total XP available
        </p>
      </div>

      {/* Project list */}
      <div className="space-y-3">
        {allModules.map(m => (
          <ProjectCard
            key={m.project.id}
            project={m.project}
            moduleTitle={m.title}
            moduleNumber={m.number}
          />
        ))}
      </div>
    </div>
  )
}

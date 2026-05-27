import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAppStore } from '@/store/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { pingWorker } from '@/api/anthropic'
import { exportSave, clearSave } from '@/utils/save'
import { useSync } from '@/hooks/useSync'

export default function SettingsScreen() {
  const {
    workerUrl, setWorkerUrl,
    apiKey, setApiKey,
    syncServerUrl, setSyncServerUrl,
    githubToken, setGithubToken,
    progress, setUserName,
    addToast,
  } = useAppStore(useShallow(s => ({
    workerUrl: s.workerUrl,         setWorkerUrl: s.setWorkerUrl,
    apiKey: s.apiKey,               setApiKey: s.setApiKey,
    syncServerUrl: s.syncServerUrl, setSyncServerUrl: s.setSyncServerUrl,
    githubToken: s.githubToken,     setGithubToken: s.setGithubToken,
    progress: s.progress,
    setUserName: s.setUserName,
    addToast: s.addToast,
  })))

  const { sync, isSyncing } = useSync()

  const [testingWorker, setTestingWorker] = useState(false)
  const [workerOk, setWorkerOk]           = useState<boolean | null>(null)
  const [localName, setLocalName]         = useState(progress.userName)

  async function handleTestWorker() {
    if (!workerUrl.trim()) return
    setTestingWorker(true)
    setWorkerOk(null)
    try {
      const ok = await pingWorker(workerUrl.trim())
      setWorkerOk(ok)
      addToast({
        variant: ok ? 'success' : 'error',
        title:   ok ? 'Worker reachable ✓' : 'Worker unreachable',
        body:    ok
          ? 'AI Tutor is ready to use.'
          : 'Could not reach the Worker. Check the URL and make sure it is deployed.',
      })
    } finally {
      setTestingWorker(false)
    }
  }

  function handleSaveName() {
    setUserName(localName.trim())
    addToast({ variant: 'success', title: 'Name updated' })
  }

  function handleExport() {
    const data = exportSave()
    if (!data) { addToast({ variant: 'error', title: 'Nothing to export' }); return }
    navigator.clipboard.writeText(data)
    addToast({ variant: 'success', title: 'Save copied to clipboard' })
  }

  function handleClear() {
    if (!confirm('Clear all progress? This cannot be undone.')) return
    clearSave()
    window.location.reload()
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 animate-fade-up">
      <h1 className="font-heading text-2xl font-bold text-ink">Settings</h1>

      {/* ── Profile ── */}
      <section className="card p-5 space-y-4">
        <h2 className="font-heading text-sm uppercase tracking-widest text-dim">Profile</h2>
        <div>
          <label className="text-xs text-ghost font-body block mb-2">Display name</label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={localName}
              onChange={e => setLocalName(e.target.value)}
              placeholder="Your name"
            />
            <button onClick={handleSaveName} className="btn-secondary px-4">
              Save
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-raised rounded-xl border border-border">
          <span className="text-xs text-ghost font-mono">Device ID</span>
          <span className="text-xs text-dim font-mono truncate">{progress.deviceId}</span>
        </div>
      </section>

      {/* ── AI Tutor ── */}
      <section className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-sm uppercase tracking-widest text-dim">AI Tutor &amp; Quiz Grading</h2>
          <span className="font-mono text-[10px] text-ghost border border-border rounded px-1.5 py-0.5">required for grading</span>
        </div>
        <p className="text-xs text-ghost leading-relaxed">
          Required for automatic quiz grading, AI Tutor chat, and project verification. Enter either your Anthropic API key (stored locally, only used in-browser) or a Cloudflare Worker proxy URL.
        </p>

        {/* Direct API key */}
        <div className="space-y-2">
          <label className="text-xs text-ghost font-body block">Anthropic API key</label>
          <input
            className="input font-mono text-sm"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-ant-…"
            type="password"
            autoComplete="off"
          />
          {apiKey.trim() && (
            <p className="text-xs text-ghost">Saved — quizzes will be graded directly via the API.</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-ghost">or use a Worker proxy</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex gap-2">
          <input
            className="input flex-1 font-mono text-sm"
            value={workerUrl}
            onChange={e => { setWorkerUrl(e.target.value); setWorkerOk(null) }}
            placeholder="https://stark-proxy.your-name.workers.dev"
            type="url"
            autoComplete="off"
          />
          <button
            onClick={handleTestWorker}
            disabled={!workerUrl.trim() || testingWorker}
            className={cn(
              'btn-secondary px-4 shrink-0',
              workerOk === true  && 'border-ok/30 text-ok',
              workerOk === false && 'border-fail/30 text-fail',
            )}
          >
            {testingWorker
              ? <Loader2 size={14} className="animate-spin" />
              : workerOk === true
              ? <Check size={14} />
              : 'Test'}
          </button>
        </div>
        {workerUrl.trim() && (
          <p className="text-xs text-ghost">
            Saved — AI Tutor will use this Worker URL.
          </p>
        )}
      </section>

      {/* ── LAN Sync ── */}
      <section className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-sm uppercase tracking-widest text-dim">LAN Sync</h2>
          <span className="font-mono text-[10px] text-ghost border border-border rounded px-1.5 py-0.5">optional</span>
        </div>
        <p className="text-xs text-ghost">
          Sync progress between your devices over Wi-Fi. Start the sync server on one device (see the repo's README), then enter its local IP address below on your other devices.
        </p>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            value={syncServerUrl}
            onChange={e => setSyncServerUrl(e.target.value)}
            placeholder="http://192.168.1.x:3001"
            type="url"
          />
          <button
            onClick={sync}
            disabled={isSyncing || !syncServerUrl}
            className="btn-sync px-4 shrink-0 min-h-[44px]"
          >
            {isSyncing ? <Loader2 size={14} className="animate-spin" /> : 'Sync'}
          </button>
        </div>
        {progress.lastSyncedAt && (
          <p className="text-xs text-ghost">
            Last synced: {new Date(progress.lastSyncedAt).toLocaleString()}
          </p>
        )}
      </section>

      {/* ── GitHub ── */}
      <section className="card p-5 space-y-4">
        <h2 className="font-heading text-sm uppercase tracking-widest text-dim">GitHub Token</h2>
        <p className="text-xs text-ghost">
          Optional. Increases GitHub API rate limits for project verification.
        </p>
        <input
          type="password"
          className="input"
          value={githubToken}
          onChange={e => setGithubToken(e.target.value)}
          placeholder="ghp_..."
          autoComplete="off"
        />
      </section>

      {/* ── Data ── */}
      <section className="card p-5 space-y-3">
        <h2 className="font-heading text-sm uppercase tracking-widest text-dim">Data</h2>
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn-secondary flex-1">
            Export Save
          </button>
          <button onClick={handleClear} className="btn-danger flex-1">
            Clear All Data
          </button>
        </div>
        <p className="text-xs text-ghost">
          Export copies your save to clipboard as a base64 string. Import via the browser console:
          <code className="block mt-1 font-mono text-spark-300 text-[10px]">
            importSave('paste-here')
          </code>
        </p>
      </section>
    </div>
  )
}

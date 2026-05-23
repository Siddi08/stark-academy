/**
 * STARK ACADEMY — Local Network Sync Server
 *
 * Run on your laptop: npm run sync-server
 * Shows your local IP. Enter that IP in the phone app's Settings → Sync.
 *
 * The server holds the "last known good" state in memory.
 * Phone pushes its state → server merges → phone pulls merged result.
 * No data ever leaves your local network.
 */
import express from 'express'
import cors from 'cors'
import os from 'os'
import { mergeProgress } from '../src/utils/sync'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

let serverState: { progress: any; devicesSeen: string[]; lastSync: number } = {
  progress: null,
  devicesSeen: [],
  lastSync: 0,
}

app.get('/sync/ping', (_req, res) => {
  res.json({ app: 'stark-academy', version: '1', devicesSeen: serverState.devicesSeen, lastSync: serverState.lastSync })
})

app.get('/sync/pull', (_req, res) => {
  res.json({ progress: serverState.progress, devicesSeen: serverState.devicesSeen })
})

app.post('/sync/push', (req, res) => {
  const { deviceId, deviceName, progress } = req.body
  if (!progress || !deviceId) {
    return res.status(400).json({ error: 'Missing deviceId or progress' })
  }

  if (!serverState.devicesSeen.includes(deviceId)) {
    serverState.devicesSeen.push(deviceId)
    console.log(`  ✅ Device connected: ${deviceName ?? deviceId}`)
  }

  if (!serverState.progress) {
    serverState.progress = progress
    serverState.lastSync = Date.now()
    console.log(`  📥 Initial state received from ${deviceName ?? deviceId}`)
    return res.json({ merged: progress, conflicts: [] })
  }

  const { merged, conflicts } = mergeProgress(serverState.progress, progress)
  serverState.progress = merged
  serverState.lastSync = Date.now()

  if (conflicts.length > 0) {
    console.log(`  🔀 Merged with ${conflicts.length} conflict(s): ${conflicts.join(', ')}`)
  } else {
    console.log(`  ✅ Sync from ${deviceName ?? deviceId} — no conflicts`)
  }

  res.json({ merged, conflicts })
})

function getLocalIPs(): string[] {
  const interfaces = os.networkInterfaces()
  const ips: string[] = []
  for (const iface of Object.values(interfaces)) {
    for (const addr of iface ?? []) {
      if (addr.family === 'IPv4' && !addr.internal) {
        ips.push(addr.address)
      }
    }
  }
  return ips
}

app.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIPs()
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║     STARK ACADEMY — Sync Server Active       ║')
  console.log('╠══════════════════════════════════════════════╣')
  console.log('║  Enter one of these IPs in your phone app:   ║')
  for (const ip of ips) {
    console.log(`║  ➜  ${ip.padEnd(40)} ║`)
  }
  console.log(`║                                              ║`)
  console.log(`║  Port: ${String(PORT).padEnd(37)} ║`)
  console.log(`║  Keep this terminal open while syncing       ║`)
  console.log('╚══════════════════════════════════════════════╝\n')
})

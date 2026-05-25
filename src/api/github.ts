import type { GithubVerifyResult } from '@/types'

export interface VerifyRepoParams {
  workerUrl: string
  repoUrl: string
  projectName: string
  rubric: string[]
  githubToken?: string
}

export async function verifyRepo(params: VerifyRepoParams): Promise<GithubVerifyResult> {
  // Parse GitHub URL
  const match = params.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match) {
    return {
      verified: false,
      score: 0,
      feedback: 'Invalid GitHub URL. Please enter a URL like https://github.com/username/repo',
      checkedItems: [],
    }
  }

  const [, owner, repo] = match
  const repoSlug = repo.replace(/\.git$/, '')
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (params.githubToken) {
    headers['Authorization'] = `Bearer ${params.githubToken}`
  }

  try {
    // Fetch repo info and README
    const [repoRes, readmeRes, treeRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repoSlug}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repoSlug}/readme`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repoSlug}/git/trees/HEAD?recursive=1`, { headers }),
    ])

    if (repoRes.status === 404) {
      return {
        verified: false,
        score: 0,
        feedback: 'Repository not found. Make sure the URL is correct and the repo is public.',
        checkedItems: [],
      }
    }
    if (repoRes.status === 403) {
      return {
        verified: false,
        score: 0,
        feedback: 'GitHub rate limit reached. Add a GitHub token in Settings to increase limits.',
        checkedItems: [],
      }
    }

    let readmeContent = ''
    if (readmeRes.ok) {
      const readmeData = await readmeRes.json() as { content?: string }
      if (readmeData.content) {
        readmeContent = atob(readmeData.content.replace(/\n/g, ''))
      }
    }

    let fileTree: string[] = []
    if (treeRes.ok) {
      const treeData = await treeRes.json() as { tree?: Array<{ path: string }> }
      fileTree = treeData.tree?.map(f => f.path) ?? []
    }

    const prompt = `You are verifying a student's GitHub project for Stark Academy.

Project: ${params.projectName}
Repository: ${owner}/${repoSlug}

Rubric (check each item):
${params.rubric.map((r, i) => `${i + 1}. ${r}`).join('\n')}

README content:
${readmeContent.slice(0, 2000)}

File tree (first 50 files):
${fileTree.slice(0, 50).join('\n')}

CRITICAL: respond with ONLY valid JSON, no markdown, no code fences:
{
  "verified": <boolean — true if >60% rubric items pass>,
  "score": <number 0-100>,
  "feedback": "<2-3 sentence overall feedback>",
  "checkedItems": [
    { "item": "<rubric item>", "passed": <boolean>, "comment": "<brief comment>" }
  ]
}`

    // POST to Worker (non-streaming)
    const res = await fetch(params.workerUrl.replace(/\/$/, ''), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages:   [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Worker error ${res.status}: ${text}`)
    }

    const data = await res.json() as { content?: Array<{ type: string; text?: string }> }
    const text = data.content?.[0]?.type === 'text' ? (data.content[0].text ?? '') : ''
    return JSON.parse(text) as GithubVerifyResult
  } catch (err) {
    return {
      verified: false,
      score: 0,
      feedback: `Verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      checkedItems: [],
    }
  }
}

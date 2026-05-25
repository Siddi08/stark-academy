# stark-proxy — Cloudflare Worker

Sits between the Stark Academy app and the Anthropic API so your `sk-ant-...` key never lives in the browser.

## One-time setup (5 steps)

### 1. Install Wrangler

```bash
npm install -g wrangler
```

### 2. Log in to Cloudflare

```bash
wrangler login
```

A browser window opens — sign in or create a free account (no credit card needed).

### 3. Install Worker dependencies

```bash
cd stark-proxy
npm install
```

### 4. Set your Anthropic API key as a secret

```bash
wrangler secret put ANTHROPIC_API_KEY
```

Paste your `sk-ant-...` key when prompted. It is encrypted at rest and never exposed.

> **Optional:** lock the proxy to your GitHub Pages origin so no one else can burn your quota:
> ```bash
> wrangler secret put ALLOWED_ORIGIN
> # paste: https://your-username.github.io
> ```

### 5. Deploy

```bash
npm run deploy
```

Wrangler prints your Worker URL, something like:

```
https://stark-proxy.your-name.workers.dev
```

Copy that URL and paste it into **Stark Academy → Settings → AI Tutor**.
Hit **Test** — it should turn green.

---

## Local dev

```bash
npm run dev
```

Starts the Worker locally at `http://localhost:8787`. Use that URL in Settings while testing.

## Endpoints

| Method | Path    | Description                        |
|--------|---------|------------------------------------|
| GET    | /ping   | Health check → `{ ok: true }`      |
| POST   | /       | Proxy to Anthropic `/v1/messages`  |
| OPTIONS| *       | CORS preflight                     |

## Free tier limits

Cloudflare Workers free tier: **100,000 requests/day**. Stark Academy sends one request per AI Tutor message and one per project verification — you will not come close to this limit.

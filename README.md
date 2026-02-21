# Sin City Saviors

An AI-powered responsible gambling companion that monitors player sessions in real time and steps in before things go sideways.

Built for hackathon 2026 · Powered by [Claude](https://anthropic.com)

---

## Try it live

**[sincitysaviors.vercel.app](https://sincitysaviors.vercel.app)** ← live demo

No setup required. Here's how to get started in under a minute:

1. Click **Start your session →** on the landing page
2. Enter your name, confirm you're 21+, and click **Continue**
3. Complete the quick mental health check-in (30 seconds)
4. On the dashboard, click **⚡ Demo Mode** — it auto-runs a scripted session that escalates from safe → high risk in ~15 seconds
5. Watch Ace step in when the risk score climbs

**Sign in with Google or GitHub** (optional) to unlock session history — your past sessions, peak risk scores, and Ace interaction stats are saved to your account.

---

## What it does

Before you play, **Ace** checks in on how you're feeling. While you play, he watches your betting patterns for signs of risk. When the score climbs, he steps in — not with a warning, but with a warm suggestion, like a casino host who's looking out for you.

- **Mental health check-in** — mood, stress, and intent adjust how closely Ace watches your session
- **Live risk engine** — detects loss chasing, velocity spikes, and bankroll erosion in real time
- **Ace AI companion** — Claude-powered, streams a personalized message when risk crosses a threshold
- **Activity suggestions** — swipeable cards offering real alternatives (dining, shows, spa) when Ace steps in
- **Session history** — every session logged with peak risk score, Ace interactions, and bankroll data

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, Recharts |
| Backend | Next.js API Routes, NextAuth.js v5 |
| AI | Claude (claude-sonnet-4-6) via Vercel AI SDK |
| Database | PostgreSQL (Neon) via Prisma 7 |
| Auth | Google OAuth, GitHub OAuth |

---

## Running locally

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) database (free tier works)
- An [Anthropic API key](https://console.anthropic.com)
- Google OAuth credentials ([Google Cloud Console](https://console.cloud.google.com))
- GitHub OAuth credentials ([GitHub Developer Settings](https://github.com/settings/developers))

### 1. Clone the repo

```bash
git clone https://github.com/Jevsunbo/SinCitySaviors.git
cd SinCitySaviors
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project:

```env
# NextAuth
AUTH_SECRET=your_auth_secret_here
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Database (Neon PostgreSQL connection string)
DATABASE_URL=postgresql://...
```

To generate `AUTH_SECRET`, run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Set up OAuth callback URLs

**Google Cloud Console** → Your OAuth app → Authorized redirect URIs:
```
http://localhost:3000/api/auth/callback/google
```

**GitHub** → Your OAuth app → Authorization callback URL:
```
http://localhost:3000/api/auth/callback/github
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How the risk engine works

Every bet updates a 0–100 risk score built from four behavioral signals:

| Signal | Threshold | Score |
|--------|-----------|-------|
| Loss chasing | Bet size increases 1.5× after a loss, twice in a row | +30 |
| Long session | Session exceeds 90 minutes | +20 |
| Velocity spike | Betting pace doubles vs. prior 10-minute window | +25 |
| Bankroll erosion | 50%+ of bankroll lost within 30 minutes | +25 |

Mental health inputs from the pre-session check-in add a baseline modifier on top:

| Signal | Condition | Modifier |
|--------|-----------|----------|
| Mood | "Not great" | +15 |
| Stress | "Very high" | +20 |
| Intent | "Need a distraction" | +25 |

**Safe** = 0–49 · **Moderate** = 50–74 · **High** = 75–100

When the score escalates, Ace automatically fires a Claude-generated message personalized to the player's session data and risk profile.

---

## Demo mode

On the dashboard, click **⚡ Demo Mode** to run a pre-scripted session that reliably escalates from safe → moderate → high risk in about 15 seconds. Useful for presentations and testing.

---

## Project structure

```
app/
  page.tsx              # Landing page
  dashboard/page.tsx    # Live session dashboard
  history/page.tsx      # Session history
  resources/page.tsx    # Responsible gambling resources
  sign-in/page.tsx      # Auth page
  api/
    ace/route.ts        # Claude streaming endpoint
    sessions/route.ts   # Session persistence
    onboarding/route.ts # Onboarding data

components/
  Dashboard.tsx         # Live chart + session controls
  AceChat.tsx           # Ace AI companion card
  ActivityCards.tsx     # Swipeable activity suggestions
  Onboarding.tsx        # Pre-session check-in flow
  SessionSummary.tsx    # End-of-session recap

lib/
  riskEngine.ts         # Risk scoring logic + RISK_CONFIG
  mockSession.ts        # Simulation + demo script
  db.ts                 # Prisma client (PostgreSQL)
```

---

## Resources

If you or someone you know is struggling with gambling:

- **National Problem Gambling Helpline:** 1-800-522-4700 (24/7, free, confidential)
- **Crisis Text Line:** Text HOME to 741741
- **Gamblers Anonymous:** [gamblersanonymous.org](https://www.gamblersanonymous.org)

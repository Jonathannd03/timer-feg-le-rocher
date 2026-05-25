# FEG le Rocher Gottesdienst Timer

A professional church service operator panel for **FEG le Rocher**. Built to run on a laptop during Sunday services — the operator controls the timer and Bible verses while the congregation sees the fullscreen view.

> Developed by **Jonathan Ndinga**

---

## Features

### Timer
- Countdown timer per service section (Abschnitt)
- Green → Orange → Red color progression as time runs out
- Overtime tracking — timer continues into negative with a "Zeit abgelaufen" banner
- Fullscreen mode with animated flip-clock display
- Play / Pause / Stop controls
- Keyboard shortcuts: `Space` (play/pause), `F` (fullscreen), `Esc` (close fullscreen)
- Wake Lock — screen never sleeps while the timer is running

### Programme (Abschnitte)
- Start blank, add sections via modal
- Section types: Begrüßung, Anbetung, Gebet, Predigt, Kollekte, Ankündigungen, Abendmahl, Kinderprogramm, Sonstiges, Stille, Andere
- Predigt type prompts for the preacher's name, shown on the timer screen
- Section dots progress indicator

### Bible Verse
- Browse the full Bible (Lutherbibel 1912 by default)
- Navigate: Book → Chapter → Verse
- Real-time German ↔ French translation toggle (Louis Segond)
- Forward / backward navigation within a chapter (arrow keys or buttons)
- Fullscreen verse display with background image
- Active verse shown in sidebar

### Layout
- **Desktop** (≥ 1024px): 3-column — Status sidebar | Timer + Bible | Programme list
- **Tablet / Mobile** (< 1024px): Tabbed layout — Info | Timer | Programm
- Responsive fullscreen overlays for both timer and Bible verse

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| State | Zustand (with persist) |
| Drag & Drop | dnd-kit |
| Bible API | [api.bible](https://scripture.api.bible) |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/feg-rocher-timer.git
cd feg-rocher-timer
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API key from [scripture.api.bible](https://scripture.api.bible):

```env
BIBLE_API_KEY=your_api_key_here
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push the repository to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add the environment variable in **Settings → Environment Variables**:
   - `BIBLE_API_KEY` — your api.bible key

Vercel auto-detects Next.js — no additional configuration needed.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause timer |
| `F` | Toggle timer fullscreen |
| `Esc` | Close fullscreen |
| `← →` | Navigate Bible verses (in verse fullscreen) |

> Arrow keys do **not** navigate sections while the timer is running, to prevent accidental resets.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BIBLE_API_KEY` | Yes | API key from [scripture.api.bible](https://scripture.api.bible) |
| `BIBLE_API_BASE` | No | Override base URL (default: `https://rest.api.bible/v1`) |

---

© 2026 FEG le Rocher · Developed by Jonathan Ndinga

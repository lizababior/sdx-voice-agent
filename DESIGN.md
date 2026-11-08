# VacMan — Frontend Design

Mobile-first web app for HVAC techs. It follows `Docs/VacMan-Build-Plan-v2.md`: one Next.js app on localhost, one work order, client tools. The tech holds a phone in one hand, often in a hot attic or a dirty crawlspace, often with gloves on. They glance at the screen and talk. The screen has to be readable in 1 second.

Build target: Next.js + Tailwind v4 (`src/app/globals.css`). Design for a 390 px wide phone first. Do not design a desktop layout.

## 1. Principles

**The top rule is ease of use and simplicity.** If a choice makes a screen harder to understand at a glance, cut it, even if a reference site does it.

1. **Voice first.** The mic is the main control. Everything else is secondary.
2. **Glanceable.** One main fact per card. Big text. No paragraphs.
3. **Glove friendly.** Tap targets are at least 56 px. No small icons that act as buttons. No hover states, no swipe-only actions.
4. **Thumb zone.** Put actions in the bottom 40% of the screen. Put information at the top.
5. **Plain words.** Say "Parts", "Labor", "Damage". Do not say "Events" or "Entries". Write like a coworker, not like software.
6. **Calm.** Few colors, no decoration. The only motion shows that the agent is listening or speaking, or that a new card arrived.

## 2. What we take from the references

We copy ideas from these sites, not their pixels. Simplicity comes first: we take only what makes the app easier to use.

The pages were fetched on Nov 8, 2026, as text only (no CSS). claude.ai and coinbase.com blocked the fetch, so their rows come from the general look of each product, not from what the fetch saw.

| Reference | What we saw | What we take |
| --- | --- | --- |
| chatgpt.com | The empty screen asks one question ("What are you working on?"), with the input and a voice button below it. The copy is short and talks to "you". | The empty job screen asks one question and points at the mic. One input on the screen. |
| sdx.community | Very short, direct lines ("Build here.", "Come build."). One main call to action, "Start Building". A row of three stats. | Short, direct copy in the app's voice. One main button per screen. |
| ycombinator.com | The logo is orange `#FF6600`, the only color on the page that sets the brand. The copy is short and confident ("Make something people want."). | `#FF6600` as the one accent color. The text does the design work. |
| claude.ai (blocked) | Not fetched. From its general look: one calm, focused screen with lots of space. | Generous spacing. Nothing on screen that the tech doesn't need. |
| coinbase.com (blocked) | Not fetched. From its general look: a big balance number and clean list rows. | The invoice total is the biggest thing on its screen. Simple list rows for line items. |

## 3. Visual language

### Theme

Dark only. A dark screen is easier to read in a dark attic and in bright sun with the brightness turned up. It also saves battery. Do not build a light theme today.

### Color tokens

Add these in `globals.css` with `@theme`.

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#0B0C0E` | Page background |
| `--color-surface` | `#16181C` | Cards, sheets |
| `--color-surface-2` | `#1F2227` | Raised or pressed surface |
| `--color-line` | `#2A2E35` | Card borders, dividers |
| `--color-text` | `#F5F5F4` | Main text (contrast above 15:1) |
| `--color-text-dim` | `#A1A5AD` | Secondary text (contrast above 7:1) |
| `--color-accent` | `#FF6600` | Orange (YC's brand color). Primary button, mic, active state |
| `--color-accent-ink` | `#1A0E00` | Text on orange |
| `--color-ok` | `#34C759` | Done, invoice ready |
| `--color-danger` | `#FF453A` | Damage events, errors |

Accent is used rarely. If more than about 10% of the screen is orange, remove some.

### Note category colors

Each note card has a 4 px left border and a small icon and label in its category color. Never use color alone: always show the word too.

| Category | Color | Label | Icon |
| --- | --- | --- | --- |
| `finding` | `#4DA3FF` blue | Finding | magnifier |
| `measurement` | `#A78BFA` violet | Measurement | gauge |
| `repair` | `#34C759` green | Repair | wrench |
| `part` | `#F2C14E` amber | Part | box |

### Type

- Font: system sans (`-apple-system, Roboto, "Segoe UI"`). It is fast and needs no download. Replace the Arial rule in `globals.css`.
- Base size is **18 px**. Never go below 14 px, and only use 14 px for labels.

| Role | Size / weight |
| --- | --- |
| Screen title (customer name) | 28 / 700 |
| Card title | 20 / 600 |
| Body | 18 / 400 |
| Label (uppercase type tag) | 13 / 600, letter-spacing 0.06em |
| Big number (invoice total) | 48 / 700, tabular numbers |

### Shape, space and depth

- Spacing uses a 4 px grid. Page side padding is 16 px. Gap between cards is 12 px.
- Card radius 16 px. Button radius 14 px. Sheet radius 24 px at the top corners.
- No shadows. Use borders (`--color-line`) to separate surfaces.
- Respect the iPhone notch and home bar: `padding-bottom: env(safe-area-inset-bottom)`.

## 4. Screens

### 4.1 Home — `src/app/page.tsx`

The home page has a greeting and one job card. There is one work order, so the list holds one job. The page also starts the Daytona sandbox, so it is often warm when the tech opens the job.

```
┌──────────────────────────┐
│ Hi, Maria                │  28 bold
│ Sun, Nov 8 · 1 job today │  dim
│                          │
│ TODAY                    │  label
│ ┌──────────────────────┐ │
│ │ ● Linda Johnson      │ │  status dot + customer
│ │ 5520 Montezuma Rd... │ │
│ │ Carrier 3-ton · R-410A│ │
│ │ No cooling...      › │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

- The whole card is one tap target (minimum height 96 px) and opens `/job`.
- No bottom nav, no menu, no search.

### 4.2 Job session — `src/app/job/page.tsx` (the main screen)

```
┌──────────────────────────┐
│ ‹ Jobs     ● Sandbox warm│  back (56 px target), status
│ Linda Johnson            │  28 bold
│ 5520 Montezuma Rd...     │  dim
│ Carrier 3-ton · R-410A   │  dim
│ No cooling. Outdoor...   │  dim, 2 lines
├──────────────────────────┤
│ ▌ FINDING                │
│ ▌ Code 32 low-pressure   │
│ ▌                  2:41p │
│ ▌ MEASUREMENT            │
│ ( Calc  Superheat 26°F ) │  result chip
│  ...scrolls...           │
│  Transcript (6) ▸        │
├──────────────────────────┤
│        ( ◉ )             │  mic, 112 px
│     Listening…           │
│  [ Wrap up the job ]     │  secondary
└──────────────────────────┘
```

- **Header** is compact and sticky. It shows a back link to the home page, the sandbox status, the customer, the address, the equipment with refrigerant and metering device, and the complaint (2 lines).
- **Sandbox status:** "warming" (orange dot), "warm" (green), "failed" (red, tap to retry). The page starts the sandbox when it opens. The mic stays disabled with the caption "Warming up the sandbox…" until the sandbox is warm or has failed.
- **Feed** takes the middle and scrolls. It holds note cards and result chips in the order they happened. The newest item is at the bottom, and the list auto-scrolls to it unless the tech scrolled up. New items slide up and fade in (200 ms).
- **Transcript** is a collapsed section at the end of the feed ("Transcript (n)"). It is secondary.
- **Dock** is fixed at the bottom with the mic and one secondary button. It has a solid `--color-bg` background and a top border.
- The screen stays awake while a session is active (`useWakeLock` in the session options).

#### Mic button states

| State | Look | Caption |
| --- | --- | --- |
| Idle | Orange filled circle, mic icon | "Tap to talk to VacMan" |
| Sandbox warming | Orange circle, dimmed, disabled | "Warming up the sandbox…" |
| Connecting | Orange ring spins | "Connecting…" |
| Listening | Orange circle with a slow pulsing ring | "Listening…" |
| Speaking | 3 animated bars (white) in the orange circle | "VacMan is talking" |
| Error / mic blocked | Gray circle, red caption | "Mic is blocked. Tap here to fix" |

- One tap starts the session. One tap ends it. The tech does not hold the button.
- Listening and Speaking come from `mode` of the `@elevenlabs/react` hook.
- Respect `prefers-reduced-motion`: replace the pulse with a static ring.

#### Cards and chips

- **Note card:** left border 4 px in the category color. Icon and label (uppercase), then the note text, then the quantity on the right (`×2`). The item code is dim at the bottom left and the time at the bottom right.
- **Result chip:** a rounded pill for a tool result, for example "Calc · Superheat 26°F" or "Invoice · INV-0001 · $707.92". A failed tool shows the chip in red with the error.
- **Undo:** when `log_job_note` removes a note, the card is replaced by a dim line "Removed: {text}". No undo button. The tech says "scratch that".
- **Empty state:** a dim centered line, "Nothing logged yet. Tap the mic and say what you see." No illustration.

#### Secondary button

- Before the invoice: **Wrap up the job**. It sends "Wrap up the job" to the agent, the same as speaking it. It is disabled when no session is running.
- After the invoice exists: **View invoice**. It reopens the sheet.

### 4.3 Invoice sheet

Opens as a bottom sheet when the `create_invoice` tool returns.

```
┌──────────────────────────┐
│          ───             │  drag handle
│ Invoice INV-0001         │
│ $707.92                  │  48 bold
│ Linda Johnson · 5520...  │  dim
│ Sent to office for review│  green
│ ┌──────────────────────┐ │
│ │ Diagnostic fee $x    │ │
│ │ Leak search    $x    │ │
│ │ R-410A ×2 lb   $x    │ │
│ │ Tax            $x    │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ PDF preview          │ │
│ └──────────────────────┘ │
│ [ Download invoice ]     │  primary, orange
│ [ Print ]                │  secondary
│ Done                     │
└──────────────────────────┘
```

- The sheet covers about 85% of the screen. The total is the biggest thing on it.
- The PDF comes from `pdfBase64` in the `/api/sandbox/invoice` answer. It is shown in an iframe and saved as a real `.pdf` by **Download invoice**. The app does not send anything. The contractor shares the file.
- Items the price book could not price show a red line, "Not priced: {codes}".
- Close by tapping the handle, the dimmed area, or "Done". Do not rely on swipe alone.

### 4.4 Console — `src/app/console/page.tsx`

A second page for the team and the finals, opened in another tab of the same browser. It is a plain dark page for a laptop, not a phone. It shows the transcript with time and detected language (with a latency badge on each agent turn), the tool calls with arguments, result and duration, and a Daytona panel with the sandbox status and the code the agent wrote with its output. The badge is green below 1.5 s and red above.

## 5. Components

Build these in `src/components/`. Keep each one small.

| Component | Notes |
| --- | --- |
| `VoiceAgent` | The session. Starts the sandbox, registers the 3 client tools, owns the feed and sends console events. |
| `Home` | Greeting and the one job card. Starts the sandbox. |
| `WorkOrderHeader` | Sticky. Back link, sandbox status, customer, address, equipment, complaint. |
| `Timeline` | The scrolling feed and the transcript section. |
| `NoteCard` | One card per note, colored by category. |
| `ResultChip` | A tool result. |
| `MicDock` | Mic button, caption, secondary button. Owns the state table in §4.2. |
| `InvoiceSheet` | Bottom sheet from §4.3. |
| `Console` | The console page from §4.4. |

## 6. Interaction rules

- Every tap gives feedback in under 100 ms: the surface changes to `--color-surface-2` while pressed.
- Use `active:` styles, not `hover:`.
- Slow actions show a text state ("Building invoice…"), not only a spinner.
- Errors are plain sentences with one next step: "Lost connection. Tap the mic to reconnect."
- Do not use modals, toasts that disappear fast, or confirm dialogs. The tech cannot read them with dirty hands. Use messages that stay on screen.

## 7. Accessibility

- Text contrast is at least 4.5:1, and 7:1 for body text. The token table meets this.
- Every control has a text label or `aria-label`. The mic button has `aria-pressed` for session state.
- The caption under the mic is an `aria-live="polite"` region.
- Support the system text size setting: use `rem`, not `px`, for text.
- Test in direct sunlight on a real phone before the demo.

## 8. Build order (Jake)

1. Tokens, system font and viewport in `globals.css` and `layout.tsx`.
2. Home page, then the job session shell: header, empty feed, `MicDock`.
3. Sandbox warm-up and the sandbox status.
4. Voice and the 3 client tools (`log_job_note`, `run_python`, `create_invoice`).
5. Invoice sheet with the PDF.
6. Console events and the console page.
7. Polish: spacing, empty and loading states, safe areas, test on a real phone. A phone cannot reach `localhost` on the laptop, so use the laptop in a phone-size window, or a tunnel only for that test.

## 9. Out of scope today

Light theme, desktop layout for the phone view, login, settings, search, more than one job, offline mode, sending the invoice (email or SMS), and any animation beyond those listed here.

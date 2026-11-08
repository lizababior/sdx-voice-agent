# VacMan — Frontend Design

Mobile-first web app for HVAC techs. The tech holds a phone in one hand, often in a hot attic or a dirty crawlspace, often with gloves on. They glance at the screen and talk. The screen has to be readable in 1 second.

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

### Event type colors

Each timeline card has a 4 px left border and a small label in its type color. Never use color alone: always show the word too.

| Type | Color | Label |
| --- | --- | --- |
| `part` | `#4DA3FF` blue | Part |
| `tool` | `#A78BFA` violet | Tool |
| `labor` | `#34C759` green | Labor |
| `damage` | `#FF453A` red | Damage |
| `note` | `#A1A5AD` gray | Note |
| substitute options | `#FF6600` orange | Substitute |

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

### 4.1 Job list — `src/app/page.tsx`

```
┌──────────────────────────┐
│ Hi, Mike                 │  28 bold
│ Sat, Nov 8 · 3 jobs      │  dim
│                          │
│ TODAY                    │  label
│ ┌──────────────────────┐ │
│ │ ● Garcia             │ │  status dot + customer
│ │ 412 Palm St          │ │
│ │ 9:30 AM · Carrier 3T │ │
│ │ Not cooling      ›   │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ ...                  │ │
│ └──────────────────────┘ │
│                          │
│ UPCOMING                 │
│ PAST                     │
└──────────────────────────┘
```

- Group by Today, Upcoming, Past. Past cards are dimmer.
- The whole card is one tap target (minimum height 96 px) and opens the job.
- Status dot: orange = in progress, green = done, gray = not started.
- Show the next job first. If a job is in progress, it gets an orange border.
- No bottom nav, no menu, no search. Six jobs do not need them.

### 4.2 Job session — `src/app/jobs/[id]/page.tsx` (the main screen)

```
┌──────────────────────────┐
│ ‹ Jobs                   │  back (56 px target)
│ Garcia                   │  28 bold
│ 412 Palm St              │  dim
│ Carrier 3T · Not cooling │  dim
├──────────────────────────┤
│ ▌PART                    │
│ ▌40/5 µF capacitor    ×1 │
│ ▌                  2:41p │
│ ▌LABOR                   │
│ ▌Replace capacitor    30m│
│  ...scrolls...           │
│                          │
├──────────────────────────┤
│        ( ◉ )             │  mic, 112 px
│     Listening…           │
│  [ Close out job ]       │  secondary
└──────────────────────────┘
```

- **Header** is compact and sticks to the top. It shows customer, address, equipment and complaint, so the tech never has to ask what the job is.
- **Timeline** takes the middle and scrolls. The newest card is at the bottom, next to the mic, and the list auto-scrolls to it. New cards slide up and fade in (200 ms). The card flashes the surface-2 color once.
- **Dock** is fixed at the bottom with the mic and one secondary button. It has a solid `--color-bg` background and a top border so cards do not show through.
- The tech can leave the screen on for a long time. Keep the screen awake with the Wake Lock API while a session is active.

#### Mic button states

| State | Look | Caption |
| --- | --- | --- |
| Idle | Orange filled circle, mic icon | "Tap to talk to VacMan" |
| Connecting | Orange ring spins | "Connecting…" |
| Listening | Orange circle with a slow pulsing ring | "Listening…" |
| Speaking | Ring becomes 3 animated bars (white), circle stays orange | "VacMan is talking" |
| Error / mic blocked | Gray circle, red caption | "Mic is blocked. Tap here to fix" |

- One tap starts the session. One tap ends it. The tech does not hold the button.
- Drive Listening and Speaking from the `mode` of the `@elevenlabs/react` hook.
- Respect `prefers-reduced-motion`: replace the pulse with a static ring.

#### Timeline cards

- Left border 4 px in type color. Label (uppercase), then the main text, then quantity or minutes on the right.
- The time is dim and small, bottom right.
- **Substitute card:** orange border. Title "Substitute for 45/5 µF". Lists up to 3 options. Each row shows part number, name, price and a one-line "why". Rows are 56 px tall.
- **Undo:** when `undo_last` removes an event, the card fades out and a dim line shows "Removed: 40/5 µF capacitor". Do not add an undo button. The tech says "scratch that".
- **Empty state:** like ChatGPT's first screen, ask one question in large text, "What are you working on?", with a dim line below it, "Tap the mic and tell VacMan." Do not show an illustration.

### 4.3 Invoice sheet

Opens as a bottom sheet when the `generate_invoice` event arrives.

```
┌──────────────────────────┐
│          ───             │  drag handle
│ Invoice ready            │
│ $487.50                  │  48 bold
│ Garcia · 412 Palm St     │  dim
│ ┌──────────────────────┐ │
│ │ Trip fee      $89.00 │ │
│ │ Labor 1.5h   $165.00 │ │
│ │ Capacitor     $48.00 │ │
│ │ Tax           $x.xx  │ │
│ └──────────────────────┘ │
│ [ Download invoice ]     │  primary, orange
│ [ Print ]  [ View full ] │  secondary
└──────────────────────────┘
```

- The sheet covers about 85% of the screen. The total is the biggest thing on it, like a balance on Coinbase.
- A single primary button: **Download invoice**. It saves the final invoice as a file. The contractor then emails or shares it. The app does not send anything. Secondary buttons are outlined, not filled.
- "View full" loads `/invoices/{job_id}` in an iframe inside the sheet.
- Close by tapping the handle, the dimmed area, or an explicit "Done" button. Do not rely on swipe alone.

## 5. Components

Build these in `src/components/`. Keep each one small.

| Component | Notes |
| --- | --- |
| `JobCard` | Props: customer, address, time, equipment, complaint, status. |
| `JobHeader` | Sticky. Customer, address, equipment, complaint. |
| `MicDock` | Mic button, caption, Close-out button. Owns the state table in §4.2. |
| `Timeline` | Polls `/api/jobs/{id}/events` every 2 s. Renders `EventCard`. |
| `EventCard` | One card per event type, by the color table in §3. |
| `SubstituteCard` | Special card for `find_substitute` results. |
| `InvoiceSheet` | Bottom sheet from §4.3. |
| `VoiceAgent` | Existing file. Adapt it to start the session with `dynamicVariables`. |

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

1. Add the color tokens and system font to `globals.css`. Set the viewport to `width=device-width, initial-scale=1, viewport-fit=cover`.
2. Job list with a mock array.
3. Job session shell: header, empty timeline, `MicDock` in the idle state.
4. Wire `VoiceAgent` to the mic states.
5. Timeline polling and `EventCard` types.
6. `SubstituteCard`.
7. `InvoiceSheet`.
8. Polish: spacing, empty and loading states, safe areas, test on a real phone over the Vercel HTTPS URL.

## 9. Out of scope today

Light theme, desktop layout, login, settings, search, offline mode, and any animation beyond the ones listed here.

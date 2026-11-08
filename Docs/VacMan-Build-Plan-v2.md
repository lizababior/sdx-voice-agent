# VacMan: Build Plan v2

Nov 8, 2026 · Liz, Jake, Deandre

This is the main build doc. It replaces `VacMan-3-Person-Build-Plan.md` (v1), which stays for history. When v1 and v2 disagree, v2 is correct.

**How to read this doc:** everyone reads sections 1 to 5. Then read your own role in section 6. Section 9 gives the reason for each decision. Read it before you change a decision.

**Milestones:** merge at 3:15. Demo loop until 3:40. Loom at 3:50. Submit at 4:10 (the deadline is 4:15).

---

## 1. Problem and solution

### Problem

An HVAC technician works on site with gloves on and gauges attached. Their hands are busy and often dirty. To troubleshoot a fault, they must stop work and look up fault codes, shop procedures or prices on a phone. They do refrigerant math (superheat, subcooling, line-set charge) by hand or in a separate app.

At the end of the job, the technician must write up what they did. This takes time in the driveway, and the notes are often incomplete. The office then turns the notes into an invoice, which delays billing. Many technicians think and speak in Spanish, but the office and the customer need English.

### Solution

VacMan is the voice assistant of **Coastal Comfort HVAC**, a fictional shop. The technician talks to VacMan on their phone during the job, hands-free, in English or Spanish.

- VacMan opens with the job details from the dispatch **work order**.
- VacMan answers troubleshooting questions from the shop **knowledge base**.
- When the technician gives gauge readings, VacMan writes Python code and runs it in a **Daytona** sandbox. VacMan then says the result and what it means.
- While the technician talks, VacMan logs **job notes** in English. The technician can correct a note at any time.
- On "wrap up", VacMan does a **read-back** of the line items and the total. After a yes, VacMan creates a priced **invoice** as a PDF, marked "Sent to office for review".

A second page, the **console**, shows what happens behind the screen.

### Track, user and finish line

- **Track:** 01 Local Business.
- **User and finish line:** "Maria is an HVAC tech with gloves on. Done means an invoice ready before she leaves the driveway."

---

## 2. Glossary

Use these words in code, prompts and talk. One word has one meaning.

| Word | Meaning |
| --- | --- |
| **Technician** | The user. In the demo, "Maria". |
| **Work order** | The dispatch record for one job: customer, address, equipment, refrigerant, metering device, complaint, last visit, technician. One hardcoded work order exists (the Johnson job). |
| **Job note** | One logged fact about the job: a finding, a measurement, a repair or a part. Always in English. |
| **Correction** | Removal of a job note by its ID, when the technician changes what they said. |
| **Read-back** | The one- or two-sentence recap of the line items and the total, before the invoice. |
| **Invoice** | The PDF that VacMan creates from the job notes and the price book. The finish line. |
| **Price book** | The shop's flat-rate price list. Each task or part has one fixed price. |
| **Saturation temperature** | The temperature at which a refrigerant boils at a given pressure. It comes from a pressure-temperature (PT) table. |
| **Superheat** | Suction line temperature minus the saturation temperature at the suction pressure. High superheat means low charge (often a leak) or a restriction. Low superheat means overcharge or flooding. On a **TXV** system the target is 8–12°F. On a **fixed orifice** system the target comes from a chart. |
| **Subcooling** | Saturation temperature at the liquid line pressure minus the liquid line temperature. The charging method on **TXV** systems. With superheat, it separates a low charge from a restriction. |
| **Schrader core** | The valve core in a service port. A common leak point. |
| **Warm sandbox** | The one Daytona sandbox for the job. It starts when the page opens and stays ready for all tool calls. |
| **Client tool** | An agent tool that the phone page runs in the browser. |
| **Turn latency** | Time from the end of the technician's turn to the start of the agent's audio. Target: less than 1.5 s. |
| **Console** | The behind-the-scenes page: transcript, tool calls, Daytona code and output, latency. |

---

## 3. The demo scenario

The team builds and tests **one** scenario from start to finish. The knowledge base covers more faults, so the agent can answer off-script, but only this path gets polish.

The Johnson job: a Carrier 24ANA (Infinity, two-stage) 3-ton condenser, R-410A, TXV. Complaint: no cooling.

1. Maria opens the job. VacMan greets her with the work order: "You're at the Johnson job, Carrier 3-ton, no cooling. What are you seeing?"
2. Maria: "The outdoor board is flashing three short, two long." VacMan answers from the Carrier 24ANA code table: code 32, low-pressure switch trip. Check the indoor airflow first, then the refrigerant charge.
3. Maria: "Suction is 105, suction line is 60, R-410A." VacMan says "running the numbers", writes Python, and runs it in Daytona. Saturation temperature at 105 psig is about 34°F, so superheat is about **26°F**. Target on a TXV system is 8–12°F (from the shop procedure). VacMan: "Superheat is about 26, so it's likely undercharged. Per the shop guide, check the Schrader cores for leaks." A result chip appears on the phone.
4. Maria, in Spanish: "Encontré la fuga en el Schrader, cambié el core, agregué dos libras." VacMan answers in Spanish. The job notes appear **in English**: leak found at the Schrader core, core replaced, 2 lb R-410A added.
5. Maria: "Also swapped the capacitor… actually no, it tested fine." The capacitor note disappears.
6. A judge asks something off-topic. VacMan answers in one line and returns to the job.
7. Maria: "Wrap up the job." VacMan reads back the line items and the total. Maria says yes. The invoice PDF appears, marked "Sent to office for review".

**Expected invoice:** diagnostic fee (DIAG-STD) $129.00, leak search (LEAK-SRCH) $249.00, Schrader core (SCHR-CORE) $89.00, R-410A (R410A-LB) 2 × $95.00. Subtotal $657.00, tax 7.75% $50.92, total **$707.92**.

The two judge curveballs are the same for every team: a change of mind mid-task, and an off-topic question. Steps 5 and 6 rehearse them.

---

## 4. User stories

### Starting the job

1. As a technician, I want VacMan to open on today's work order, so that I do not have to say the customer, address or equipment.
2. As a technician, I want VacMan to greet me with the job summary (customer, equipment, complaint), so that I can confirm that I am at the correct job.
3. As a technician, I want to start the conversation with one tap on a large button, so that I can start with gloves on.
4. As a technician, I want the work order to show the equipment model, refrigerant type and metering device, so that VacMan and I use the same equipment facts.
5. As a technician, I want the work order to show the date and result of the last visit, so that I know the history of the unit.
6. As a technician, I want VacMan to be ready immediately when I tap the button, so that I do not wait on the customer's driveway.

### Troubleshooting

7. As a technician, I want to say a fault code, so that VacMan tells me what the code means for this equipment.
8. As a technician, I want VacMan to follow the shop troubleshooting procedure, so that I work the way the shop expects.
9. As a technician, I want VacMan to tell me the next check to do, so that I keep a clear order of work.
10. As a technician, I want VacMan to tell me when the knowledge base does not have the answer, so that I can trust what it does say.
11. As a technician, I want short spoken answers of one or two sentences, so that I can listen while I work.
12. As a technician, I want to interrupt VacMan while it speaks, so that I can give new information immediately.
13. As a technician, I want VacMan to reply in less than about 1.5 seconds, so that the conversation feels natural.
14. As a technician, I want to ask about shop policies (warranty, after-hours rates, when to call the office), so that I give the customer correct information.
15. As a technician, I want to ask the price of a repair, so that I can quote the customer before I do the work.

### Calculations

16. As a technician, I want to say my suction pressure, suction line temperature and refrigerant, so that VacMan calculates the superheat.
17. As a technician, I want to say my liquid line pressure and temperature, so that VacMan calculates the subcooling on a TXV system.
18. As a technician, I want VacMan to compare the result with the target and say what it means, so that I know the next step.
19. As a technician, I want to ask how much refrigerant to add for a long line set, so that I charge the system correctly.
20. As a technician, I want to ask for the breaker and wire size for a given minimum circuit ampacity, so that I install the correct parts.
21. As a technician, I want VacMan to run the math as code, so that I can trust the numbers.
22. As a technician, I want to see the result of a calculation as a small chip on my phone, so that I can check the number later.
23. As a technician, I want VacMan to say "running the numbers" while a calculation runs, so that I know that it is working.

### Job notes

24. As a technician, I want VacMan to log a note each time I say what I found or did, so that I do not write notes at the end.
25. As a technician, I want to see each note appear on my phone as I talk, so that I know VacMan understood me.
26. As a technician, I want to correct a note by voice, so that the job record is correct.
27. As a technician, I want a corrected note to disappear from the list, so that it does not appear on the invoice.
28. As a technician, I want parts and repairs in my notes to match items in the price book, so that the invoice prices are correct.
29. As a technician, I want to say quantities ("added two pounds"), so that the invoice shows the correct quantity.
30. As a technician, I want gauge readings and calculation results logged as notes, so that the office sees the diagnosis.

### Spanish

31. As a Spanish-speaking technician, I want to speak Spanish at any time, so that I can describe the work in the language that I think in.
32. As a Spanish-speaking technician, I want VacMan to answer in Spanish when I speak Spanish, so that I understand the answer immediately.
33. As a Spanish-speaking technician, I want VacMan to change language without a button, so that I do not touch my phone with gloves on.
34. As a Spanish-speaking technician, I want my notes logged in English, so that the office can read them.
35. As a technician, I want VacMan to keep the same voice in both languages, so that it sounds like one assistant.

### Wrap-up and invoice

36. As a technician, I want to say "wrap up the job", so that VacMan starts the invoice.
37. As a technician, I want a read-back of the line items and the total in one or two sentences, so that I can check it before it goes out.
38. As a technician, I want to change the read-back before I confirm, so that the invoice is correct.
39. As a technician, I want VacMan to create the invoice only after I say yes, so that no wrong invoice goes to the office.
40. As a technician, I want to see the invoice PDF on my phone, so that I can show it to the customer.
41. As a technician, I want the invoice marked "Sent to office for review", so that I know that my work is done.
42. As an office manager, I want each invoice to show the shop header, invoice number, customer, address, equipment, technician and date, so that it is complete.
43. As an office manager, I want line items priced from the price book, so that prices are the same for all technicians.
44. As an office manager, I want the subtotal, tax at 7.75% and the total, so that I can bill the customer.
45. As an office manager, I want a short "Work performed" paragraph in English, so that I understand the job without a call to the technician.
46. As a customer, I want a clear invoice that says what was wrong and what was done, so that I understand what I pay for.

### Recovery and curveballs

47. As a technician, I want to change my mind in the middle of a task, so that VacMan follows the new plan.
48. As a technician, I want VacMan to answer an off-topic question in one short line and then return to the job, so that the job continues.
49. As a technician, I want VacMan to tell me plainly when a tool fails, so that I know that a number or an invoice is missing.
50. As a technician, I want VacMan to try a failed tool once more before it stops, so that a short failure does not stop the job.

### Console

51. As a developer on the team, I want the live transcript with timestamps, so that I can debug the conversation.
52. As a developer on the team, I want the detected language of each line, so that I can check the Spanish switch.
53. As a developer on the team, I want each tool call with its arguments, result and duration, so that I can find slow or failed calls.
54. As a developer on the team, I want the sandbox status and the code that the agent wrote, with its output, so that I can check the calculations.
55. As a developer on the team, I want the turn latency with a green or red badge against 1.5 seconds, so that I can tune the agent for speed.
56. As a presenter at the finals, I want to switch to the console during the demo, so that I can show that the computation is real.
57. As a developer on the team, I want the console to update without a backend, so that it has no extra parts that can fail.

---

## 5. Shared contract

Agree on this first. Then each person builds alone until the merge at 3:15. To change the contract, tell the other two first.

### Architecture

- One Next.js app (this repo). No separate backend, no ngrok, no Vercel.
- The demo runs on **localhost** on one laptop. The microphone works on localhost without HTTPS.
- The agent tools are **client tools**. The phone page runs them in the browser. The handlers call the Next.js API routes. The routes call Daytona with the server-side key. The browser never gets an API key.
- The phone page sends each event to the console through `BroadcastChannel("vacman")`. Both pages must be open in the same browser on the same laptop.

### Files

```
/data       work-order.json, price-book.csv, pt-tables.csv
/sandbox    hvac.py (saturation helper), invoice.py (pricing + PDF)
/kb         troubleshooting-sop.md, carrier-fault-codes.md, price-book.md, shop-policies.md
/agent      config.ts (prompt, tools, LLM, voice, languages, knowledge base)
/src/app    page.tsx (phone view), console/page.tsx, api/sandbox/*
```

### Data formats

- **`work-order.json`:** `{job_id, customer_name, address, equipment, model, refrigerant, metering_device, complaint, last_visit, technician}`. The demo job is a Carrier 24ANA136A003 with a TXV.
- **`price-book.csv`:** `item_code, name, price, unit`. `unit` is `each` or `lb`.
- **`pt-tables.csv`:** `refrigerant, psig, sat_temp_f`. Rows for `R-410A` and `R-22`.

### API routes

| Route | Body | Returns |
| --- | --- | --- |
| `GET /api/conversation-token` | — | `{token}` (exists) |
| `POST /api/sandbox/start` | — | `{sandboxId, status}` |
| `POST /api/sandbox/run` | `{sandboxId, code}` | `{stdout, exitCode, ms}` |
| `POST /api/sandbox/invoice` | `{sandboxId, workOrder, notes}` | `{invoiceNumber, lineItems, subtotal, tax, total, pdfBase64}` |

### Agent tools

| Tool | Parameters | What the handler does |
| --- | --- | --- |
| `log_job_note` | `action` (`add` or `remove`), `text` (English), `category`, `item_code?`, `quantity?`, `note_id?` | Adds or removes a job note in the page state. `add` returns `{saved: true, note_id}`. `remove` returns `{removed: true}`. Return only these fields: the agent tracks its notes from the conversation. As a backstop, refuse a second `DIAG-STD` with `{saved: false, reason: "already logged"}`. |
| `run_python` | `code` | Calls `/api/sandbox/run`. Returns stdout, or the error text. |
| `create_invoice` | — | Calls `/api/sandbox/invoice` with the work order and the notes. Returns the invoice number and the total. |

### Job note

`{id, text, category, item_code?, quantity?}`. `category` is one of `finding | measurement | repair | part`.

### Dynamic variables

The phone page passes these from the work order when it starts the session: `job_id`, `customer_name`, `address`, `equipment`, `model`, `refrigerant`, `metering_device`, `complaint`.

### Sandbox helper

`hvac.saturation_temp(refrigerant, psig)` returns the saturation temperature in °F. It interpolates `pt-tables.csv`. The agent writes the rest of each calculation.

### Console events

| Event | Fields |
| --- | --- |
| `transcript` | role, text, language, time |
| `tool_start` | name, args |
| `tool_end` | name, result, ms, ok |
| `sandbox` | id, status (`warming`, `warm`, `failed`) |
| `latency` | ms |

---

## 6. Roles and tasks

### Liz: agent + data + knowledge base

- [ ] **Data files.** Give them to Deandre first, because his scripts read them.
  - `work-order.json`: the Johnson job (section 3).
  - `price-book.csv`: about 30 flat-rate items. Include a diagnostic fee, leak search, Schrader core replacement, R-410A per lb, capacitor, contactor and an after-hours fee.
  - `pt-tables.csv`: R-410A and R-22 rows. R-410A at 105 psig must give about 34°F.
- [ ] **Knowledge base.** Write `troubleshooting-sop.md`, `price-book.md` and `shop-policies.md`. Find the real, public Carrier fault-code sheet and save it as `carrier-fault-codes.md`. `npm run agent:setup` uploads all 4 and attaches them to the agent.
- [ ] **Agent config** in `agent/config.ts`: LLM, one multilingual voice, language detection with an `es` preset, the dynamic variables, the first message, the 3 tools and the knowledge base. `npm run agent:setup` pushes all of it.
- [ ] **System prompt** with the rules in section 7.
- [ ] **LLM test.** Compare `claude-haiku-5-5` and `gemini-3.5-flash` on turn latency and tool calls. Keep the winner in `agent/config.ts`.
- [ ] **Demo script** for Maria (section 3) and the **Loom**.

### Deandre: Daytona back office

- [ ] **`POST /api/sandbox/start`.** Create one sandbox. Install `reportlab`. Upload `price-book.csv`, `pt-tables.csv`, `hvac.py` and `invoice.py`. Set an auto-stop interval. Return the sandbox ID.
- [ ] **`sandbox/hvac.py`.** `saturation_temp(refrigerant, psig)`. Check: R-410A at 105 psig gives about 34°F.
- [ ] **`POST /api/sandbox/run`.** Run the agent's code in the sandbox with a 10-second timeout. `import hvac` must work. Return stdout, exit code and duration.
- [ ] **`sandbox/invoice.py`.** Input: the work order and the notes as JSON. Price each note that has an item code. Add tax at 7.75% on the subtotal. Write a short "Work performed" paragraph in English. Create the PDF (contents in section 8). Print JSON with the totals and the PDF as base64.
- [ ] **`POST /api/sandbox/invoice`.** Run `invoice.py` in the sandbox and return its JSON.
- [ ] **Scenario replay** (`npm run replay`). See section 8.

### Jake: phone view + console + integration

Before you write code, read the guides in `node_modules/next/dist/docs/` (see `AGENTS.md`). For the ElevenLabs API, read the `.d.ts` files in `node_modules/@elevenlabs/react`.

- [ ] **Phone view** (`/`), phone width, dark: work order header, a large mic button ("VacMan is listening / speaking"), live job notes with an icon for each category, result chips, the transcript.
- [ ] **Sandbox warm-up.** When the page opens, call `/api/sandbox/start`. Keep the sandbox ID. Show the status.
- [ ] **Voice and tools.** Adapt `src/components/VoiceAgent.tsx`. Start the session with the dynamic variables. Register the 3 tool handlers with `useConversationClientTool`. Remove `src/app/api/run-code`.
- [ ] **Invoice panel.** When `create_invoice` returns, show a slide-up panel with the PDF and the status "Sent to office for review".
- [ ] **Events.** Send each console event to `BroadcastChannel("vacman")`. Measure turn latency from the conversation callbacks.
- [ ] **Console** (`/console`): transcript with time and language, tool calls with arguments, result and duration, the Daytona panel, and a latency badge for each turn (green below 1.5 s, red above).
- [ ] **Merge.** Wire all tools to Deandre's routes.

---

## 7. Agent behavior

These rules go into the system prompt. This section is the single source for agent behavior.

- Speak in one or two short, plain sentences, as in a phone call.
- Answer in the technician's language. Write all job notes and all invoice text in English.
- Use the knowledge base for fault codes, procedures, prices and policies. When the knowledge base does not have the answer, say so.
- Use `run_python` for all math. Use `hvac.saturation_temp(refrigerant, psig)`. Say "running the numbers" first. Say the result and the target, then the most likely cause first, then the check that confirms it.
- Log a job note for each finding, measurement, repair and part. Use price book item codes and quantities. Each note is a short phrase of up to 12 words.
- Log the diagnostic fee (DIAG-STD) as its own note, once per job. When a leak is found, log the leak search (LEAK-SRCH) once.
- Log each item once: check the notes already logged in the conversation first.
- To correct a note, remove it with the `note_id` from its add result.
- On "wrap up", do the read-back in one or two sentences. Call `create_invoice` only after a yes.
- Answer an off-topic question in one line, then return to the job.
- When a tool fails, say so, try once more, then continue. Never invent a result.

---

## 8. Invoice, testing and demo

### Invoice contents

Shop header (Coastal Comfort HVAC), invoice number, customer name and address, equipment (model and refrigerant), technician, date, line items from the price book, subtotal, tax at 7.75% and total, and a short "Work performed" paragraph in English. The phone shows the PDF with the status "Sent to office for review".

### Testing

- **A good test checks external behavior only.** It sends inputs at the seam and checks outputs. It does not check internal functions or the code that the agent writes.
- **One seam: the tool-call boundary.** `npm run replay` sends the demo's tool calls in order, against the real sandbox, with no mocks:
  1. Add the diagnosis and measurement notes.
  2. Add the repair notes, including a capacitor.
  3. Remove the capacitor note.
  4. Run superheat code for 105 psig, 60°F and R-410A.
  5. Create the invoice.
- It prints `PASS` or `FAIL` for each check: no capacitor on the invoice, superheat 26°F ±2, the expected invoice from section 3 (total $707.92), PDF not empty, the same sandbox for all calls.
- **Prior art:** `npm run smoke` uses the same style.
- **Agent behavior:** `npm run agent:test` runs ElevenLabs simulation tests (greeting, fault code, price, policy, superheat, Spanish notes, correction, wrap-up, off-topic) with mocked tools. An LLM judge scores each success condition. Use `--k 3` for pass@k. Tests live in `agent/tests.ts`.
- **Voice layer (latency, interruptions):** the demo loop checks it.

### Demo loop (3:15–3:40)

Run section 3 from end to end at least 5 times. Watch the console latency badges. If they are red, try the other LLM.

### Loom (3:50)

- Record the **phone view only**.
- Open with one sentence: "Maria is an HVAC tech with gloves on. Done means an invoice ready before she leaves the driveway."
- Include the Spanish step (about 15 seconds).
- Stop before 2:00. Record 3 or more takes.
- One teammate plays Maria from the script and speaks naturally.

### Submission (4:10)

Repo link, the Loom, track (01 Local Business), user and finish line. Say that the calculations and the invoices run in a Daytona sandbox.

### Finals (5:00)

Run the same loop live. Then show the console for about 30 seconds: the Daytona code and the latency badges.

---

## 9. Decisions and reasons

Read the reason before you change a decision.

| Decision | Reason |
| --- | --- |
| One polished scenario, not general troubleshooting | Judges score what they see in 2 minutes. A general troubleshooter is hard to make reliable in 3 hours. |
| The finish line is an invoice PDF, marked "Sent to office for review" | "Solves the problem" (×2) asks for a real action. A PDF is visible. The status is honest without email. |
| Knowledge base: fictional shop documents plus the real Carrier fault-code sheet | Real codes make the answers credible. Shop documents make it "this shop's knowledge". |
| Equipment: Carrier 24ANA (TXV), not a basic condenser | Basic Carrier condensers have no board codes. The 24ANA manual has code 32 (low-pressure switch trip: check charge and indoor airflow), which fits the scenario. High superheat on a TXV system still points to low charge, so the demo numbers stay the same. |
| Knowledge base in the prompt, not retrieval | The 4 documents are about 3,500 tokens. Retrieval adds a lookup to each turn and can miss. If latency is red, change the usage mode to `auto`. |
| The price book document is generated from the CSV | Prices have one source, so the agent and the invoice always agree. |
| Daytona runs code that the agent writes | A sandbox earns its place when it runs code that nobody wrote in advance. Fixed pricing alone could run in a Next.js route, and judges would see a bolt-on. |
| The invoice also runs in the same warm sandbox | The sandbox is already warm, and the invoice is real data work in Daytona. |
| A saturation helper in the sandbox | The agent writes shorter code, so it makes fewer errors. |
| Live job notes through `log_job_note` | Judges watch the notes appear. A correction visibly removes a line. The invoice uses structured notes, not free text. |
| Correction by note ID, not "undo last" | The technician can correct any note, not only the last one. |
| `log_job_note` returns only `{saved, note_id}`, not the full list | With the full list, the agent compared it with its memory and re-logged items when they differed, which caused duplicate charges. The agent tracks its notes from the conversation. |
| Leak search is billed when a leak is found | A found leak means a leak search was done, and it is billable. It makes the demo invoice the same on every run. |
| Expressive mode off | The agent writes plain text. Audio tags such as [happy] would show in the phone transcript. |
| Read-back and a yes before the invoice | A real technician wants to check. It is also a natural point for the "change of mind" curveball. |
| A preloaded work order as dynamic variables | It saves about 15 seconds of the Loom. Dispatch works this way. The invoice gets the customer data free. |
| One hardcoded work order, no job list | Only one job is demoed. A job list is UI that scores nothing. |
| Flat-rate price book | Most residential HVAC shops use flat rate. The invoice is simple. The technician does not track hours by voice. |
| Phone-width web UI | It matches the user. It reads clearly in the Loom. |
| Off-topic: one line, then back to the job | The rubric asks the agent to recover when a judge goes off-topic. A refusal does not recover. |
| Spanish from the start, by auto-detection | It counts for the ElevenLabs prize. A technician with gloves on cannot tap a toggle. |
| Notes and invoice always in English | The strongest Spanish story: the technician speaks their language, and the office gets English. |
| One multilingual voice | One consistent assistant sounds more natural than a voice change mid-call. |
| Two pages: phone view and console | The product stays clean. The console shows judges the machinery. |
| `BroadcastChannel` for the console | About 20 lines, no backend. The demo is on one laptop anyway. |
| Latency badges on the console | They show the top-weighted criterion ("Works live", ×2) instead of asking judges to trust it. |
| Result chips on the phone view | The Loom shows the phone view only, so the Round 1 judges must see that real computation happened. |
| The Loom shows only the product | It is a product demo. The console is for the finals and for debugging. |
| The Loom opens with the user and the finish line | Judges watch about 13 Looms and need the frame in 5 seconds. |
| A tool failure is said plainly, with one retry | The rubric says "no faked steps". An honest recovery scores better than a freeze. |
| Client tools, Next.js only, localhost | No ngrok URL that changes, no second server, no public code-execution route. |
| LLM chosen by a test | "Works live" (×2) depends on latency. Ten minutes of testing beats a guess. |
| The pre-kickoff scaffold stays in this repo | The scaffold is generic setup only. An organizer must confirm at 12:30 that it is allowed. |
| Name: VacMan | A vacuum pump is on every HVAC job. The name is short and easy to remember. |

---

## 10. Out of scope

Email, SMS or any other real message. Payments. More than one work order or a working job list (a static list with greyed-out jobs is optional polish). Login and accounts. Storage after the session. Telephone calls. Deployment. Computer vision. Real customer data. An office page to edit or approve invoices. Languages other than English and Spanish.

## 11. Open facts

- The organizer's answer on the pre-kickoff scaffold.
- The result of the LLM test.

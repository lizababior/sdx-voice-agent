# VacMan: short demo script

About 75 seconds in total. Use the Johnson job.

## Intro (about 15 seconds)

"This is VacMan, a voice assistant for HVAC techs. Maria's hands are full and she has gloves on. She just talks, and by the time she leaves the driveway, the invoice is done.

Liz built the agent: the voice, the prompt, the shop knowledge and Spanish. Jake built the phone app and the live console. Deandre built the Daytona back end, which runs the refrigerant math and makes the invoice PDF."

## Demo (about 60 seconds)

Tap **Linda Johnson**, then tap the mic.

1. **"Board's flashing three short, two long."**
   Expect: code 32, low-pressure trip. Check airflow and charge.
2. **"Suction 105, suction line 60."**
   Expect: "Running the numbers", then superheat about 26, so likely low charge. A calculation chip appears (run in Daytona).
3. **"Encontré la fuga en el Schrader, cambié el core, agregué dos libras."**
   Expect: a Spanish answer. The notes appear in English.
4. **"Also swapped the capacitor… actually no, it tested fine."**
   Expect: the capacitor note disappears (change-of-mind curveball).
5. **"Wrap up the job."** Read-back, then **"Yes."**
   Expect: the invoice appears, VacMan reads the total, and the mic shuts off.

## Close

"Notes, math and invoice, all hands-free, in English or Spanish."

Skip the off-topic curveball in the Loom to save time. At the live finals, the judges ask one anyway.

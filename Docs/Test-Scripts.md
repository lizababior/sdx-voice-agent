# VacMan test scripts

Three extra jobs for testing beyond the Johnson demo. The work orders are in `data/extra-work-orders.json`. `npm run replay` checks the math and the invoice totals below against the real sandbox.

Each script covers the two judge curveballs: a change of mind and an off-topic question. Read the technician lines aloud. The "Expect" lines say what should happen.

> The app shows only the Johnson job today. To voice-test these jobs, the job page must load them (Jake).

---

## Job 2: Dan Whitfield, failed capacitor (after hours)

Goodman GSX140361, R-410A, TXV. Complaint: outdoor unit hums, fan does not spin.

1. **"Unit's humming but the fan isn't spinning."**
   Expect: per the shop guide, check power and test the capacitor.
2. **"Cap is rated 45/5. The herm side reads 41."**
   Expect: "running the numbers", then about **8.9% below rated**, more than the 6% limit, so replace it. A result chip appears.
3. **"Replaced the dual run cap. Log the diagnostic and the after-hours fee too."**
   Expect: notes for CAP-DUAL, DIAG-STD and DIAG-AH.
4. **"Contactor's pitted, I replaced it, single pole."**
   Expect: a note for CONT-1P.
5. Curveball: **"Wait, the contactor's actually fine, I put the old one back."**
   Expect: the contactor note disappears.
6. Off-topic: **"Did the Padres win last night?"**
   Expect: one short line, then back to the job.
7. **"Wrap up the job."** → read-back → **"Yes."**
   Expect: Diagnostic $129 + after-hours $95 + capacitor $245 = $469, tax $36.35, **total $505.35**.

---

## Job 3: Rosa Delgado, iced coil (Spanish)

Rheem RA1430AJ1NA, R-410A, TXV. Complaint: cools poorly, the indoor coil ices up.

1. **"El filtro está muy sucio y el serpentín estaba congelado."**
   Expect: a Spanish answer (check airflow first, let the coil thaw). The notes appear **in English**.
2. **"Cambié el filtro de una pulgada y limpié el serpentín del evaporador."**
   Expect: notes for FILTER-1IN and COIL-CLEAN-EVAP, in English.
3. **"Liquid line is 365 psig, liquid line temp is 98."**
   Expect: subcooling about **12°F**, which is within 10 ± 3, so the charge is fine.
4. Curveball: **"Actually, it was the 4-inch filter, not the 1-inch."**
   Expect: the 1-inch note is removed and a FILTER-4IN note is added.
5. Off-topic: **"¿Qué hora es en Madrid?"**
   Expect: one short Spanish line, then back to the job.
6. **"Wrap up the job."** → **"Sí."**
   Expect: Diagnostic $129 + 4-inch filter $75 + evaporator coil cleaning $349 = $553, tax $42.86, **total $595.86**.

---

## Job 4: Earl Simmons, low R-22 charge

Carrier 38TKB036300, R-22, fixed orifice. Complaint: runs all day, the house stays warm.

1. **"Suction is 58, suction line is 55, R-22."**
   Expect: superheat about **22.6°F**, high, so likely low on charge.
2. **"How much is R-22 per pound?"**
   Expect: $165 per pound, and R-22 repairs cost more because it is no longer produced.
3. **"Customer doesn't want a leak search, just top it off."**
   Expect: a note that refrigerant added without a leak repair has no warranty.
4. **"Added a pound and a half of R-22."**
   Expect: an R22-LB note with quantity 1.5.
5. Curveball: **"Actually, make that 2 pounds."**
   Expect: the 1.5 lb note is replaced with 2 lb.
6. **"Wrap up the job."** → **"Yes."**
   Expect: Diagnostic $129 + 2 lb R-22 $330 = $459, tax $35.57, **total $494.57**.

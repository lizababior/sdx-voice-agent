# Coastal Comfort HVAC: troubleshooting procedure (SOP)

This is the shop procedure for residential split air conditioners. Follow the steps in order. Log each finding, measurement, repair and part as a job note.

## 1. No cooling: first checks

1. Confirm the call for cooling at the thermostat (cooling mode, setpoint below room temperature).
2. Check power: breaker on, disconnect closed, 230 V at the contactor. On a Carrier 24ANA, code 47 means no 230 V at the unit.
3. Check the indoor unit: blower runs, filter is clean, evaporator coil is not frozen.
4. Check the outdoor unit: compressor and fan run, condenser coil is clean.
5. Read the status code on the outdoor board. See the Carrier fault-code document.

## 2. Low pressure trip (Carrier code 32 or lockout 83)

Carrier says: check refrigerant charge and indoor airflow. Do airflow first, because a dirty filter or a frozen coil also causes low pressure.

1. **Indoor airflow.** Check the filter, the blower and the evaporator coil. If the coil is frozen, turn the system off and let it thaw before you measure the charge.
2. **Charge.** Connect gauges. Run the system for 15 minutes in high stage. Measure the suction pressure and the suction line temperature at the outdoor service valve. Calculate the superheat. On a TXV system, also measure the liquid line pressure and temperature and calculate the subcooling.
3. **Interpret** with the targets in section 3.
4. **If undercharged:** do a leak search (section 4) before you add refrigerant. Do not top off a system with a leak without telling the customer. If the customer declines the leak search, log that as a job note.

## 3. Charge targets

| Measurement | Formula | Target |
| --- | --- | --- |
| Superheat | Suction line temperature − saturation temperature at suction pressure | TXV system: 8–12°F. Fixed orifice: use the superheat chart on the unit (indoor wet bulb and outdoor dry bulb), usually 5–15°F. |
| Subcooling | Saturation temperature at liquid line pressure − liquid line temperature | The value on the unit nameplate. Usually 10°F ± 3°F on Carrier units. |

Use the PT table for the saturation temperature. Always calculate; do not estimate.

| Superheat | Subcooling | Likely cause |
| --- | --- | --- |
| High | Low | Undercharged (leak) |
| High | High | Restriction (TXV, filter drier, kinked line) |
| Low | High | Overcharged |
| Low | Low | Low indoor airflow, or a TXV stuck open |

## 4. Leak search order

Search the most common leak points first:

1. **Schrader cores** at both service valves. Use bubble solution. A leaking core is the most common small leak on a split system.
2. **Service valve caps and flare or braze joints** at the outdoor unit.
3. **Evaporator coil** (electronic leak detector at the drain pan and the coil).
4. **Line set**, especially where it passes through walls.

## 5. Repairs

- **Schrader core:** replace it with a core removal tool. The system can stay charged. Replace the caps and tighten them.
- **Brazed leak:** recover the charge, repair, pressure test with nitrogen, evacuate to 500 microns, then weigh in the charge.
- **Adding refrigerant (R-410A):** add it as a liquid, slowly, into the suction side. Charge to the target superheat or subcooling. Log the pounds added.
- **Capacitor:** test it with a meter. Replace it if it reads more than 6% below the rated µF value. Use the same µF and the same or higher voltage.
- **Contactor:** replace it if the contacts are pitted or burnt.

## 6. Line-set charge adjustment

Carrier factory charge covers 15 feet of line set. For each foot more than 15 feet, add 0.6 ounce of R-410A for a 3/8-inch liquid line.

## 7. Electrical sizing

Use the unit nameplate. The breaker must not be larger than the MOCP (maximum overcurrent protection). Size copper wire (60°C) to the MCA (minimum circuit ampacity):

| MCA up to | Wire |
| --- | --- |
| 15 A | 14 AWG |
| 20 A | 12 AWG |
| 30 A | 10 AWG |
| 40 A | 8 AWG |
| 55 A | 6 AWG |

## 8. Refrigerant handling

Only EPA 608 certified technicians handle refrigerant. Recover refrigerant; never vent it. R-22 is no longer produced, so tell the customer that R-22 repairs cost more.

## 9. Job notes and close-out

- Log each finding, measurement, repair and part with the price book item code and the quantity.
- Log a diagnostic fee (DIAG-STD) on every service call.
- Before you leave, confirm the invoice with the technician's read-back.

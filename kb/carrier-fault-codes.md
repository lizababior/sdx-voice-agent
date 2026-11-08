# Carrier 24ANA outdoor unit status codes

Source: Carrier 24ANA manual, "Status Codes" and "Table 6 – Troubleshooting".
https://homeappliance.manualsonline.com/manuals/mfg/carrier/24ana.html?p=13

Covers the Carrier 24ANA family (24ANA1 and 24ANA7), Infinity two-stage air conditioners. Codes on other Carrier families can differ. Always confirm with the code legend inside the unit's access panel.

## How to read the code

The amber status light on the outdoor control board flashes the code. Short flashes give the first digit. Long flashes give the second digit. A short flash is 0.25 seconds on. A long flash is 1.0 second on. The code repeats after 2.5 seconds with the light off.

Example: 3 short flashes, then 2 long flashes, is code 32.

On solid with no flash means standby (no call for operation). 1 flash means low-stage operation. 2 flashes means high-stage operation. These are normal.

## Retry sequence for codes 31, 32, 71 and 72

The control opens the compressor contactor. The outdoor fan runs for up to 15 minutes. If there is still a call for cooling, the control tries the compressor again after a 15-minute delay. If the fault clears, the unit runs normally. If not, the fan stops, the code keeps flashing, and the control tries again every 15 minutes. Cycling 24 V power skips the 15-minute delay.

## Code table

| Code | Fault | What the unit does | Carrier's check |
| --- | --- | --- | --- |
| 16 | System communications failure | — | Communication with the user interface lost. Check wiring to the user interface, indoor and outdoor units. |
| 25 | Invalid model plug | The unit does not run without the correct model plug. | The control does not detect a model plug, or detects an invalid one. |
| 31 | High pressure switch open | Retry sequence. | High-pressure switch trip. Check refrigerant charge, outdoor fan operation, and coils for airflow restrictions. |
| 32 | Low pressure switch open | Retry sequence. | Low-pressure switch trip. Check refrigerant charge and indoor airflow. |
| 45 | Control fault | — | The outdoor control board has failed. Replace the control board. |
| 46 | Brown out (230 V) | No compressor or fan operation until the voltage is above 190 V. | Line voltage below 187 V for at least 4 seconds. Verify line voltage. |
| 47 | No 230 V at unit | — | No 230 V at the contactor when the indoor unit has power and there is a call. Verify that the disconnect is closed and the 230 V wiring is connected. |
| 53 | Outdoor air temperature sensor fault | — | Sensor not reading or out of range. Ohm out the sensor and check wiring. |
| 55 | Outdoor coil sensor fault | — | Sensor not reading or out of range. Ohm out the sensor and check wiring. |
| 56 | Thermistors out of range | — | Wrong relationship between the coil sensor and the outdoor air sensor. Ohm out the sensors and check wiring. |
| 71 | Low-stage thermal cutout | Retry sequence. | Compressor operation stopped during a low-stage call. Possible internal compressor overload trip, or start relay and capacitor held in circuit too long (if installed). |
| 72 | High-stage thermal cutout | Retry sequence. | Same as 71, for high stage. |
| 73 | Contactor shorted | — | Compressor voltage sensed with no call. Contactor may be stuck closed, or there is a wiring error. |
| 74 | No 230 V at compressor (24ANA1 only) | — | No compressor voltage when the compressor should start. Contactor may be stuck open, or there is a wiring error. |
| 75 | Low stage did not start (24ANA7 only) | — | Start voltage at the VR terminal not reached in low stage. |
| 76 | Low stage did not start 3 times (24ANA7 only) | Low stage locked out for 30 minutes. | Start voltage not reached on 3 low-stage starts in a row. |
| 77 | High stage did not start (24ANA7 only) | — | Start voltage at the VS terminal not reached in high stage. |
| 78 | High stage did not start 3 times (24ANA7 only) | High stage locked out for 30 minutes. | Start voltage not reached on 3 high-stage starts in a row. |
| 81 | Low-stage thermal lockout | Locked out for 4 hours or until 24 V power is cycled. | Thermal cutout on three low-stage cycles in a row. |
| 82 | High-stage thermal lockout | Locked out for 4 hours or until 24 V power is cycled. | Thermal cutout on three high-stage cycles in a row. |
| 83 | Low pressure lockout | Locked out for 4 hours or until 24 V power is cycled. | Low-pressure switch trip on 3 cycles in a row. Same checks as code 32. |
| 84 | High pressure lockout | Locked out for 4 hours or until 24 V power is cycled. | High-pressure switch trip on 3 cycles in a row. Same checks as code 31. |
| 85 | Low contactor open (24ANA7 only) | — | No compressor voltage when it should start. The low-stage contactor may be stuck open, or there is a wiring error. |
| 87 | High contactor open (24ANA7 only) | — | Same as 85, for the high-stage contactor. |

Code 86 is not used.

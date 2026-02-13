[MAXSKINS_PLAYER_SCREEN_HARD_LOCK_SESSION_VAULT.txt](https://github.com/user-attachments/files/25298617/MAXSKINS_PLAYER_SCREEN_HARD_LOCK_SESSION_VAULT.txt)

MAXSKINS – PLAYER SCREEN HARD LOCK SESSION
Timestamp: 2026-02-13 03:55:35

============================================================
SECTION 1 – STRUCTURE (LOCKED)
============================================================

1. No avatar image on Player Screen.
2. Player name + score stepper merged into one unified bar.
3. Score stepper range: 0–99.
4. On new hole load, score defaults to PAR.
5. No scroll rule – entire player screen must fit 390x844 without scrolling.
6. Eight vertical pills (2 rows of 4) aligned with same left/right margins as:
   - Hole/Par
   - Player bar
   - Bottom nav

============================================================
SECTION 2 – PRIMARY STAT PILLS (ROW 1)
============================================================

Pills: Fairway / Sand / Green / Putts

Fairway / Sand / Green:
- Non-exclusive toggles.
- Tap = ball appears inside pill.
- Outer gold ring lights up.
- Tap again = off.

Putts:
- Tap cycles 0 → 9 → 0.
- 0 = white (neutral, no number).
- 1 = gold.
- 2 = green.
- 3–9 = red.
- Pill ring lights when putts > 0.
- Hold 1 second = reset to 0.

============================================================
SECTION 3 – SECONDARY PILLS (ROW 2)
============================================================

Pills: Penalty / Notes / Fairway AI / Green AI

Lower row pills reduced ~25% height to prevent scroll.
Aligned vertically with upper row and top elements.

============================================================
SECTION 4 – NOTES SYSTEM (PERMANENT FEATURE)
============================================================

When Notes is tapped:
- Opens bottom drawer.
- Microphone activates immediately.
- Speech-to-text transcription.
- Golf preset quick phrases available.
- Notes saved with:
  - Player
  - Hole
  - Timestamp

This feature is permanently locked in product direction.

============================================================
SECTION 5 – HONORS SYSTEM (LOGIC DRIVEN)
============================================================

- Honors pill located under header.
- 75% width centered.
- When player has honors:
  - Gold ring.
  - Gold text.
  - Pulses for 60 seconds.
  - Then remains steady gold.
- On next hole, if honors retained:
  - Pulse again for 60 seconds.

Audio (optional future add):
- Single subtle chime on honors change (not repeating).

============================================================
SECTION 6 – SUBMIT SCORE FLOW
============================================================

Button text: "Submit Score"

Tap 1:
- Changes to "Confirm"
- 2-second confirmation window begins.

If no second tap:
- Reverts to "Submit Score"

Tap 2 within window:
- Sends score packet to scorekeeper.

Failure case:
- If network fails, no sound plays.
- Show not sent state.
- Allow retry.

Only scorekeeper can finalize hole.

============================================================
SECTION 7 – AUDIO LOCK (OFFICIAL)
============================================================

1) PLAYER_SUBMIT_CONFIRMED
   - Audible putter strike sound.
   - Plays only after successful submission.

2) SCOREKEEPER_HOLE_FINALIZED
   - Ball dropping in cup sound.
   - Plays on all devices in group.

No stepper sounds.
No toggle sounds.
Audio reinforces authority hierarchy.

============================================================
SECTION 8 – FINALIZE / SCOREKEEPER FLOW
============================================================

Player:
Submit → Confirm → Sent

Scorekeeper:
Review submissions → Finalize hole

On finalization:
- Ball drop sound plays.
- Hole closes.
- Player screens advance to next hole state.

============================================================
SECTION 9 – CURRENT STATE
============================================================

Latest working UI file:
MAXSKINS_PLAYER_SCREEN_UI_V4_LIFT_UP_10PCT.html

- No scroll confirmed.
- All pills aligned.
- Layout compressed upward ~10%.
- Room preserved for one additional horizontal element if needed.

============================================================
END OF HARD LOCK SESSION
============================================================

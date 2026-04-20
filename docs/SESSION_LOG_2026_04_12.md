# Session Log — 2026-04-12
**Project:** Coolhole (coolhole.ca)
**Agent:** Claude Sonnet 4.6
**Duration context:** Short session (~30 min)

## What happened

Three playlist UX improvements requested by user.

---

### Change 1 — "Add to End" button label

**Problem:** The URL queue submission had two icon-only buttons (`#queue_next`, `#queue_end`) with SVG icons and no text. Users couldn't tell which was "play next" vs "add to end."

**Fix:** Replaced SVG icon content with plain text labels:
- `#queue_next` → "Queue Next"
- `#queue_end` → "Add to End"
- `#ce_queue_next` → "Queue Next" (custom embed section)
- `#ce_queue_end` → "Add to End" (custom embed section)

**File:** `templates/channel.pug` lines 119-121, 132-134

---

### Change 2 — Videos auto-delete after play (temporary by default)

**Problem:** Videos queued via the URL input stayed in the playlist permanently after playing. Once the playlist ran through, it looped from the beginning forever. Users expected videos to be consumed and removed as they played.

**Root cause:** The "Add as temporary" checkbox (`input.add-temp`) was unchecked by default. Items added without `temp: true` are permanent — `_playNext()` in `src/channel/playlist.js` only calls `_delete()` on items where `this.current.temp === true`. Permanent items just advance to the next item and loop.

**Fix:** Added `checked` attribute to all three `input.add-temp` checkboxes in `templates/channel.pug` (URL input, custom embed, playlist manager sections). All queued items now default to temporary and are removed from the playlist after they finish playing.

**File:** `templates/channel.pug` lines 124, 137, 150

---

### Change 3 — Queue item delete button always visible for mods

**Problem:** Queue item action buttons (Play / Queue Next / Make Permanent / Delete) were hidden by default and only appeared on right-click (contextmenu). Mods with `playlistdelete` permission had no obvious way to delete queue items.

**Fix:** Changed the hide logic in `addQueueButtons()` (`www/js/util.js`):
- Before: hide menu if `qbtn_hide` user setting is on (regardless of permissions)
- After: if user has `playlistdelete` permission, always show the menu — never hide it

Users without delete permission still respect their `qbtn_hide` setting.

**File:** `www/js/util.js` lines 577-579

---

## Files changed

| File | Change |
|------|--------|
| `templates/channel.pug` | Button text labels; `add-temp` checked by default |
| `www/js/util.js` | Queue button always visible for users with `playlistdelete` |

## Deploy

1. `node bin/build-player.js` locally
2. `scp www/js/util.js templates/channel.pug` → `/opt/coolhole/prod/coolhole/`
3. `docker compose build coolhole && docker compose up -d coolhole`
4. Verified `prod-coolhole-1` started clean

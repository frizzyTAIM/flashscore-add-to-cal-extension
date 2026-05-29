# Flashscore Add-to-Calendar Chrome Extension

## Project Overview

A Chrome Extension (Manifest V3) that adds a 📅 button to every upcoming football match on `flashscore.info/favorites/`. Clicking the button opens Google Calendar in a new tab with the match pre-filled as a 2-hour event.

Built for personal use only. Installed as an unpacked extension via `chrome://extensions`.

## GitHub Repository

https://github.com/frizzyTAIM/flashscore-add-to-cal-extension

GitHub Issues are used as the task tracker. All 5 issues are already created there.

## PRD

### Problem Statement

The user follows multiple football teams and leagues on Flashscore. The `/favorites/` page shows all upcoming matches, but adding them to Google Calendar requires manual copy-paste work. With 4-5 matches per week this is tedious and matches get missed.

### Solution

Chrome Extension adds a 📅 emoji button in the right icon column of every upcoming match on `flashscore.info/favorites/`. Clicking opens Google Calendar in a new tab with pre-filled event data. After clicking, the icon shows ✅ for 2 seconds as confirmation.

### Key Decisions

- **Calendar integration**: Google Calendar URL with pre-filled params (no OAuth — just open a link)
- **Event title format**: `{tournament}: {homeTeam} — {awayTeam}` (e.g. `LaLiga: Real Madrid — Ath Bilbao`)
- **Event duration**: 2 hours (start time + 2h)
- **Event description**: Flashscore match URL + venue/stadium
- **Time handling**: All times converted to UTC in `YYYYMMDDTHHmmssZ` format; Google Calendar displays in user's local timezone automatically
- **Scope**: Only on `flashscore.info/favorites/`, only upcoming matches (startTime > now)
- **Dynamic updates**: MutationObserver handles DOM changes without page reload
- **Button placement**: Right icon column of each match row, alongside existing icons (headphones etc.)
- **No button duplication**: Rows marked with a data attribute after injection

## Architecture: 4 Modules

### 1. MatchScraper
Reads the DOM of `/favorites/`, returns array of `MatchData` objects for upcoming matches only.

```
MatchData {
  homeTeam: string
  awayTeam: string
  tournament: string
  startTime: Date        // UTC
  venue: string | null
  matchUrl: string
}
```

### 2. CalendarUrlBuilder
Pure function. Takes `MatchData`, returns Google Calendar URL string. No DOM interaction.

### 3. ButtonInjector
Inserts 📅 into the right column of each match row. Handles click → open URL in new tab → show ✅ for 2s → revert to 📅. Prevents duplicate buttons via data attribute.

### 4. DOMObserver
Initializes MutationObserver on the matches container. Runs MatchScraper + ButtonInjector on page load and on every DOM change.

## GitHub Issues (task tracker)

- [#1 Extension scaffold](https://github.com/frizzyTAIM/flashscore-add-to-cal-extension/issues/1) — manifest.json, content script skeleton. **Start here.**
- [#2 CalendarUrlBuilder + tests](https://github.com/frizzyTAIM/flashscore-add-to-cal-extension/issues/2) — pure URL builder module. No blockers.
- [#3 MatchScraper + tests](https://github.com/frizzyTAIM/flashscore-add-to-cal-extension/issues/3) — DOM scraper module. No blockers.
- [#4 Full integration](https://github.com/frizzyTAIM/flashscore-add-to-cal-extension/issues/4) — wire all modules together. Blocked by #1, #2, #3.
- [#5 MutationObserver](https://github.com/frizzyTAIM/flashscore-add-to-cal-extension/issues/5) — dynamic DOM updates. Blocked by #4.

## Testing

- **CalendarUrlBuilder**: full unit test coverage (time conversion, URL format, edge cases)
- **MatchScraper**: tests with mock HTML (no network requests)
- **ButtonInjector**: tests with jsdom (insertion, deduplication, click feedback)
- **DOMObserver**: no tests (it's just wiring)

## How to Start a New Session

When opening this project in VS Code and starting a new Claude Code chat, say:

> "Read CLAUDE.md and the GitHub issues, then let's continue building the extension starting with issue #1."

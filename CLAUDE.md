# Flashscore Add-to-Calendar Chrome Extension

## Project Overview

A Chrome Extension (Manifest V3) that adds a 📅 button to every upcoming football match on Flashscore — on the favorites page, tournament/league pages, and a team's own fixtures page. Clicking the button opens Google Calendar in a new tab with the match pre-filled as a 2-hour event.

Built for personal use only. Installed as an unpacked extension via `chrome://extensions`. See [README.md](README.md) for install instructions (EN/RU).

## GitHub Repository

https://github.com/frizzyTAIM/flashscore-add-to-cal-extension (public)

GitHub Issues are the task tracker. Check current state with `gh issue list --state all` rather than relying on any list hardcoded here — that list will always go stale.

## PRD

### Problem Statement

The user follows multiple football teams and leagues on Flashscore. Match lists (favorites, tournament pages, a team's fixtures page) show all upcoming matches, but adding them to Google Calendar requires manual copy-paste work. With 4-5 matches per week this is tedious and matches get missed.

### Solution

Chrome Extension adds a 📅 emoji button in the right icon column of every upcoming match, wherever Flashscore lists one (see Scope below). Clicking opens Google Calendar in a new tab with pre-filled event data. After clicking, the icon shows ✅ for 2 seconds as confirmation.

### Key Decisions

- **Calendar integration**: Google Calendar URL with pre-filled params (no OAuth — just open a link)
- **Event title format**: `{tournament}: {homeTeam} — {awayTeam}` (e.g. `LaLiga: Real Madrid — Ath Bilbao`)
- **Event duration**: 2 hours (start time + 2h)
- **Event description**: Flashscore match URL + venue/stadium
- **Time handling**: All times converted to UTC in `YYYYMMDDTHHmmssZ` format; Google Calendar displays in user's local timezone automatically
- **Scope**: `flashscore.info/favorites/`, `flashscore.info/football/*/*/` (tournament/league pages), `flashscore.info/team/*/*/fixtures/` (team fixtures) — only upcoming matches (startTime > now). Check `manifest.json` content_scripts.matches for the authoritative current list.
- **Dynamic updates**: MutationObserver handles DOM changes without page reload
- **Button placement**: Right icon column of each match row, alongside existing icons (headphones etc.)
- **No button duplication**: Rows marked with a data attribute after injection
- **Selector fragility**: Flashscore's CSS classes drift over time (e.g. `.event__time` was replaced by `.event__stageTime` on most pages). `matchScraper` checks both old and new class names as fallbacks rather than assuming one — expect to keep doing this when pages break.

## Architecture: 4 Modules

### 1. MatchScraper
Reads the DOM of the current page (favorites, tournament, or team fixtures — see Scope), returns array of `MatchData` objects for upcoming matches only.

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

## Testing

- **CalendarUrlBuilder**: full unit test coverage (time conversion, URL format, edge cases)
- **MatchScraper**: tests with mock HTML (no network requests)
- **ButtonInjector**: tests with jsdom (insertion, deduplication, click feedback)
- **DOMObserver**: no tests (it's just wiring)

## How to Start a New Session

When opening this project in VS Code and starting a new Claude Code chat, say:

> "Read CLAUDE.md, check open GitHub issues (`gh issue list`), and let's continue from there."

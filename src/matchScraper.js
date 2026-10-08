function findPrecedingDateInfo(eventSection) {
  let sibling = eventSection && eventSection.previousElementSibling;
  while (sibling) {
    if (sibling.classList.contains('subTabs--myFsLabel')) {
      const dateEl = sibling.querySelector('.myFs__dateInfo');
      if (dateEl) return dateEl;
    }
    sibling = sibling.previousElementSibling;
  }
  return null;
}

function parseDateTime(dateText, timeText) {
  const dateMatch = dateText.match(/(\d{2})\.(\d{2})\./);
  const timeMatch = timeText.match(/(\d{2}):(\d{2})/);
  if (!dateMatch || !timeMatch) return null;

  const day = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10) - 1;
  const hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);

  const year = new Date().getFullYear();
  const date = new Date(year, month, day, hours, minutes);

  if (date.getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000) {
    return new Date(year + 1, month, day, hours, minutes);
  }

  return date;
}

// Tournament pages encode date+time together: "18.06. 00:00"
function parseDateTimeFromText(text) {
  const match = text.match(/(\d{2})\.(\d{2})\.\s+(\d{2}):(\d{2})/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const hours = parseInt(match[3], 10);
  const minutes = parseInt(match[4], 10);

  const year = new Date().getFullYear();
  const date = new Date(year, month, day, hours, minutes);

  if (date.getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000) {
    return new Date(year + 1, month, day, hours, minutes);
  }

  return date;
}

// Far-future fixtures whose kickoff time hasn't been announced yet show only a date,
// with the year spelled out since it's often the following year: "27.02.2027"
function parseDateOnly(text) {
  const match = text.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const year = parseInt(match[3], 10);

  return new Date(year, month, day);
}

// Team pages show today's match as bare time with no date at all, e.g. "19:30" — since
// there's no date-header sibling to read (that's a favorites-page-only structure), any
// bare time with no preceding date info must mean "today".
function parseTimeOnlyAsToday(timeText, now) {
  const timeMatch = timeText.match(/^(\d{2}):(\d{2})$/);
  if (!timeMatch) return null;

  const hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);

  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
}

function scrapeMatches(now = new Date()) {
  const matches = [];
  const rows = document.querySelectorAll('.event__match--scheduled[data-event-row="true"]');

  for (const row of rows) {
    const sportSection = row.closest('.sportName');
    // Flashscore renamed this testid from wcl-scores-simple-text-01 to wcl-simple-text-01
    // on at least some pages; keep both so the league name doesn't silently disappear.
    const tournament = sportSection
      ?.querySelector('span[data-testid="wcl-scores-simple-text-01"], span[data-testid="wcl-simple-text-01"]')
      ?.textContent?.trim() ?? '';

    // Flashscore has migrated most pages from .event__time to .event__stageTime;
    // keep both so we don't silently stop matching if a page still uses the old one.
    const timeText = (row.querySelector('.event__time') || row.querySelector('.event__stageTime'))
      ?.textContent?.trim() ?? '';

    let startTime;
    let timeKnown = true;
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(timeText)) {
      // Fixture far enough out that Flashscore hasn't published a kickoff time yet,
      // e.g. "27.02.2027" — still show a button, just for an all-day event.
      startTime = parseDateOnly(timeText);
      timeKnown = false;
    } else if (/\d{2}\.\d{2}\./.test(timeText)) {
      // Tournament/team page: date+time in one field, e.g. "18.06. 00:00"
      startTime = parseDateTimeFromText(timeText);
    } else {
      // Favorites page: time only, e.g. "22:30" — find date from section header.
      // Team pages show today's match the same bare-time way but with no date header
      // at all (implicitly today), so fall back to today's date in that case.
      const eventSection = row.closest('.event--section');
      const dateEl = findPrecedingDateInfo(eventSection);
      const dateText = dateEl ? dateEl.textContent.trim() : '';
      startTime = dateEl ? parseDateTime(dateText, timeText) : parseTimeOnlyAsToday(timeText, now);
    }

    if (!startTime || startTime <= now) continue;

    const homeTeam = row.querySelector('.event__homeParticipant')?.textContent?.trim() ?? '';
    const awayTeam = row.querySelector('.event__awayParticipant')?.textContent?.trim() ?? '';
    const link = row.querySelector('a.eventRowLink');
    const matchUrl = link?.href ?? '';

    matches.push({ homeTeam, awayTeam, tournament, startTime, timeKnown, venue: null, matchUrl, element: row });
  }

  return matches;
}

if (typeof module !== 'undefined') module.exports = { scrapeMatches, parseDateTime, parseDateTimeFromText, parseDateOnly, parseTimeOnlyAsToday, findPrecedingDateInfo };

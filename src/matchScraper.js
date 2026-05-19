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

  // Handle year rollover: if date is more than 30 days in the past, it's next year
  if (date.getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000) {
    return new Date(year + 1, month, day, hours, minutes);
  }

  return date;
}

function scrapeMatches(now = new Date()) {
  const matches = [];
  const rows = document.querySelectorAll('.event__match--scheduled[data-event-row="true"]');

  for (const row of rows) {
    const sportSection = row.closest('.sportName');
    const tournament = sportSection
      ?.querySelector('span[data-testid="wcl-scores-simple-text-01"]')
      ?.textContent?.trim() ?? '';

    const eventSection = row.closest('.event--section');
    const dateEl = findPrecedingDateInfo(eventSection);
    const dateText = dateEl ? dateEl.textContent.trim() : '';

    const timeText = row.querySelector('.event__time')?.textContent?.trim() ?? '';
    const startTime = parseDateTime(dateText, timeText);
    if (!startTime || startTime <= now) continue;

    const homeTeam = row.querySelector('.event__homeParticipant')?.textContent?.trim() ?? '';
    const awayTeam = row.querySelector('.event__awayParticipant')?.textContent?.trim() ?? '';
    const link = row.querySelector('a.eventRowLink');
    const matchUrl = link?.href ?? '';

    matches.push({ homeTeam, awayTeam, tournament, startTime, venue: null, matchUrl, element: row });
  }

  return matches;
}

if (typeof module !== 'undefined') module.exports = { scrapeMatches, parseDateTime, findPrecedingDateInfo };

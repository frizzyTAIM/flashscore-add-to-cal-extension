function formatUtc(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function formatDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function buildCalendarUrl(match) {
  const title = `${match.tournament}: ${match.homeTeam} — ${match.awayTeam}`;
  let description = match.venue
    ? `${match.matchUrl}\n${match.venue}`
    : match.matchUrl;

  let dates;
  if (match.timeKnown === false) {
    // Flashscore hasn't announced a kickoff time yet — an all-day event avoids implying
    // a false specific time (e.g. midnight).
    const end = new Date(match.startTime);
    end.setDate(end.getDate() + 1);
    dates = `${formatDateOnly(match.startTime)}/${formatDateOnly(end)}`;
    description += '\n\nExact kickoff time not yet announced by Flashscore.';
  } else {
    const start = formatUtc(match.startTime);
    const end = formatUtc(new Date(match.startTime.getTime() + 2 * 60 * 60 * 1000));
    dates = `${start}/${end}`;
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details: description,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

if (typeof module !== 'undefined') module.exports = { buildCalendarUrl };

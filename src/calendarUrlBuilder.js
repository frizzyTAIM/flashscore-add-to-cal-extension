function formatUtc(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function buildCalendarUrl(match) {
  const start = formatUtc(match.startTime);
  const end = formatUtc(new Date(match.startTime.getTime() + 2 * 60 * 60 * 1000));
  const title = `${match.tournament}: ${match.homeTeam} — ${match.awayTeam}`;
  const description = match.venue
    ? `${match.matchUrl}\n${match.venue}`
    : match.matchUrl;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    details: description,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

if (typeof module !== 'undefined') module.exports = { buildCalendarUrl };

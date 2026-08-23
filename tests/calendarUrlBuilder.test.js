const { buildCalendarUrl } = require('../src/calendarUrlBuilder');

const baseMatch = {
  homeTeam: 'Real Madrid',
  awayTeam: 'Ath Bilbao',
  tournament: 'LaLiga',
  startTime: new Date('2026-05-23T21:00:00Z'),
  venue: 'Santiago Bernabeu',
  matchUrl: 'https://www.flashscore.info/match/abc123/',
};

function parseUrl(url) {
  const [base, qs] = url.split('?');
  return { base, params: new URLSearchParams(qs) };
}

test('base URL is Google Calendar render endpoint', () => {
  const { base } = parseUrl(buildCalendarUrl(baseMatch));
  expect(base).toBe('https://calendar.google.com/calendar/render');
});

test('action param is TEMPLATE', () => {
  const { params } = parseUrl(buildCalendarUrl(baseMatch));
  expect(params.get('action')).toBe('TEMPLATE');
});

test('event title format is tournament: home — away', () => {
  const { params } = parseUrl(buildCalendarUrl(baseMatch));
  expect(params.get('text')).toBe('LaLiga: Real Madrid — Ath Bilbao');
});

test('start time is formatted as YYYYMMDDTHHmmssZ', () => {
  const { params } = parseUrl(buildCalendarUrl(baseMatch));
  const [start] = params.get('dates').split('/');
  expect(start).toBe('20260523T210000Z');
});

test('end time is exactly 2 hours after start', () => {
  const { params } = parseUrl(buildCalendarUrl(baseMatch));
  const [, end] = params.get('dates').split('/');
  expect(end).toBe('20260523T230000Z');
});

test('description contains matchUrl and venue when venue is present', () => {
  const { params } = parseUrl(buildCalendarUrl(baseMatch));
  expect(params.get('details')).toBe(
    'https://www.flashscore.info/match/abc123/\nSantiago Bernabeu'
  );
});

test('description contains only matchUrl when venue is null', () => {
  const match = { ...baseMatch, venue: null };
  const { params } = parseUrl(buildCalendarUrl(match));
  expect(params.get('details')).toBe('https://www.flashscore.info/match/abc123/');
});

test('special characters in team names are URL-encoded', () => {
  const match = { ...baseMatch, homeTeam: 'Atlético Madrid', awayTeam: 'FC Köln' };
  const url = buildCalendarUrl(match);
  expect(url).toContain('Atl%C3%A9tico');
  expect(url).toContain('K%C3%B6ln');
});

test('end time crosses midnight correctly', () => {
  const match = { ...baseMatch, startTime: new Date('2026-05-23T23:00:00Z') };
  const { params } = parseUrl(buildCalendarUrl(match));
  const [, end] = params.get('dates').split('/');
  expect(end).toBe('20260524T010000Z');
});

// --- timeKnown: false (kickoff time not yet announced) ---

test('timeKnown false produces an all-day event (date only, no time, no Z)', () => {
  const match = { ...baseMatch, startTime: new Date(2027, 1, 27), timeKnown: false };
  const { params } = parseUrl(buildCalendarUrl(match));
  expect(params.get('dates')).toBe('20270227/20270228');
});

test('timeKnown false appends a note that the kickoff time is unannounced', () => {
  const match = { ...baseMatch, startTime: new Date(2027, 1, 27), timeKnown: false, venue: null };
  const { params } = parseUrl(buildCalendarUrl(match));
  expect(params.get('details')).toContain('not yet announced');
});

/** @jest-environment jsdom */

// Загружаем зависимости вручную (в браузере они глобальные через manifest.json)
const { buildCalendarUrl } = require('../src/calendarUrlBuilder');
const { injectButtons } = require('../src/buttonInjector');

global.buildCalendarUrl = buildCalendarUrl;

function makeRow({ withAudio = true } = {}) {
  const row = document.createElement('div');
  row.className = 'event__match event__match--scheduled';
  row.setAttribute('data-event-row', 'true');
  row.innerHTML = `
    <div class="event__homeParticipant">Arsenal</div>
    <div class="event__awayParticipant">Chelsea</div>
    <div class="event__time">20:00</div>
    ${withAudio ? '<a class="event__icon event__icon--audio"></a>' : ''}
  `;
  document.body.appendChild(row);
  return row;
}

function makeMatch(row) {
  return {
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    tournament: 'EPL',
    startTime: new Date('2099-05-19T17:00:00Z'),
    venue: null,
    matchUrl: 'https://www.flashscore.info/match/football/arsenal/chelsea/',
    element: row,
  };
}

beforeEach(() => {
  document.body.innerHTML = '';
  window.open = jest.fn();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('вставляет кнопку 📅 в строку матча', () => {
  const row = makeRow();
  injectButtons([makeMatch(row)]);
  const btn = row.querySelector('.event__icon--cal');
  expect(btn).not.toBeNull();
  expect(btn.textContent).toBe('📅');
});

test('audio-элемент модифицируется на месте и получает класс --cal', () => {
  const row = makeRow({ withAudio: true });
  injectButtons([makeMatch(row)]);
  const btn = row.querySelector('.event__icon--audio');
  expect(btn).not.toBeNull();
  expect(btn.classList.contains('event__icon--cal')).toBe(true);
  expect(btn.innerHTML).toBe('📅');
});

test('без иконки наушников кнопка добавляется в конец строки', () => {
  const row = makeRow({ withAudio: false });
  injectButtons([makeMatch(row)]);
  const btn = row.querySelector('.event__icon--cal');
  expect(row.lastElementChild).toBe(btn);
});

test('повторный вызов не дублирует кнопку', () => {
  const row = makeRow();
  const match = makeMatch(row);
  injectButtons([match]);
  injectButtons([match]);
  expect(row.querySelectorAll('.event__icon--cal')).toHaveLength(1);
});

test('data-cal-injected выставляется на строку после инъекции', () => {
  const row = makeRow();
  injectButtons([makeMatch(row)]);
  expect(row.dataset.calInjected).toBe('1');
});

test('клик открывает Google Calendar в новом табе', () => {
  const row = makeRow();
  injectButtons([makeMatch(row)]);
  const btn = row.querySelector('.event__icon--cal');
  btn.click();
  expect(window.open).toHaveBeenCalledTimes(1);
  const [url, target] = window.open.mock.calls[0];
  expect(url).toContain('calendar.google.com');
  expect(target).toBe('_blank');
});

test('после клика иконка меняется на ✅', () => {
  const row = makeRow();
  injectButtons([makeMatch(row)]);
  const btn = row.querySelector('.event__icon--cal');
  btn.click();
  expect(btn.textContent).toBe('✅');
});

test('через 2 секунды иконка возвращается к 📅', () => {
  const row = makeRow();
  injectButtons([makeMatch(row)]);
  const btn = row.querySelector('.event__icon--cal');
  btn.click();
  jest.advanceTimersByTime(2000);
  expect(btn.textContent).toBe('📅');
});

test('строка без element пропускается без ошибки', () => {
  const match = makeMatch(null);
  expect(() => injectButtons([match])).not.toThrow();
});

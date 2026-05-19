/** @jest-environment jsdom */

const { scrapeMatches, parseDateTime, findPrecedingDateInfo } = require('../src/matchScraper');

function buildDOM(html) {
  document.body.innerHTML = html;
}

const FUTURE = new Date('2020-01-01T00:00:00Z'); // "now" в прошлом → всё считается upcoming

const BASE_HTML = `
<div class="leagues--live">
  <div class="subTabs subTabs--myFsLabel">
    <div class="myFs__dateInfo">Today - 19.05.</div>
  </div>
  <div class="event--section">
    <div class="sportName soccer">
      <div class="headerLeague__wrapper">
        <span data-testid="wcl-scores-simple-text-01">EPL</span>
      </div>
      <div class="event__match event__match--scheduled" data-event-row="true">
        <a class="eventRowLink" href="https://www.flashscore.info/match/football/bournemouth/manchester-city/"></a>
        <div class="event__homeParticipant">Bournemouth</div>
        <div class="event__awayParticipant">Manchester City</div>
        <div class="event__time">22:30</div>
      </div>
      <div class="event__match event__match--scheduled" data-event-row="true">
        <a class="eventRowLink" href="https://www.flashscore.info/match/football/chelsea/tottenham/"></a>
        <div class="event__homeParticipant">Chelsea</div>
        <div class="event__awayParticipant">Tottenham</div>
        <div class="event__time">23:15</div>
      </div>
    </div>
  </div>
  <div class="subTabs subTabs--myFsLabel">
    <div class="myFs__dateInfo">Saturday - 23.05.</div>
  </div>
  <div class="event--section">
    <div class="sportName soccer">
      <div class="headerLeague__wrapper">
        <span data-testid="wcl-scores-simple-text-01">LaLiga</span>
      </div>
      <div class="event__match event__match--scheduled" data-event-row="true">
        <a class="eventRowLink" href="https://www.flashscore.info/match/football/real-madrid/ath-bilbao/"></a>
        <div class="event__homeParticipant">Real Madrid</div>
        <div class="event__awayParticipant">Ath Bilbao</div>
        <div class="event__time">23:00</div>
      </div>
    </div>
  </div>
</div>
`;

// --- parseDateTime ---

test('parseDateTime: корректно разбирает дату и время', () => {
  const date = parseDateTime('Saturday - 23.05.', '23:00');
  expect(date).not.toBeNull();
  expect(date.getDate()).toBe(23);
  expect(date.getMonth()).toBe(4); // May = 4 (0-indexed)
  expect(date.getHours()).toBe(23);
  expect(date.getMinutes()).toBe(0);
});

test('parseDateTime: работает с "Today - 19.05."', () => {
  const date = parseDateTime('Today - 19.05.', '22:30');
  expect(date).not.toBeNull();
  expect(date.getDate()).toBe(19);
  expect(date.getMonth()).toBe(4);
  expect(date.getHours()).toBe(22);
  expect(date.getMinutes()).toBe(30);
});

test('parseDateTime: возвращает null при неверном формате', () => {
  expect(parseDateTime('bad string', '99:99')).toBeNull();
  expect(parseDateTime('', '')).toBeNull();
});

// --- scrapeMatches ---

test('возвращает корректный MatchData для обычного матча', () => {
  buildDOM(BASE_HTML);
  const matches = scrapeMatches(FUTURE);
  const laliga = matches.find(m => m.homeTeam === 'Real Madrid');

  expect(laliga).toBeDefined();
  expect(laliga.awayTeam).toBe('Ath Bilbao');
  expect(laliga.tournament).toBe('LaLiga');
  expect(laliga.matchUrl).toContain('real-madrid');
  expect(laliga.venue).toBeNull();
});

test('возвращает несколько матчей из одной секции даты', () => {
  buildDOM(BASE_HTML);
  const matches = scrapeMatches(FUTURE);
  const eplMatches = matches.filter(m => m.tournament === 'EPL');
  expect(eplMatches).toHaveLength(2);
});

test('возвращает матчи из разных секций дат', () => {
  buildDOM(BASE_HTML);
  const matches = scrapeMatches(FUTURE);
  expect(matches).toHaveLength(3);
});

test('исключает матчи, у которых startTime <= now', () => {
  buildDOM(BASE_HTML);
  const now = new Date('2099-01-01T00:00:00Z'); // далёкое будущее → все матчи в прошлом
  const matches = scrapeMatches(now);
  expect(matches).toHaveLength(0);
});

test('матч без иконки наушников всё равно включается', () => {
  buildDOM(`
    <div class="leagues--live">
      <div class="subTabs subTabs--myFsLabel">
        <div class="myFs__dateInfo">Saturday - 23.05.</div>
      </div>
      <div class="event--section">
        <div class="sportName soccer">
          <div class="headerLeague__wrapper">
            <span data-testid="wcl-scores-simple-text-01">Bundesliga</span>
          </div>
          <div class="event__match event__match--scheduled" data-event-row="true">
            <a class="eventRowLink" href="https://www.flashscore.info/match/football/dortmund/bayern/"></a>
            <div class="event__homeParticipant">Dortmund</div>
            <div class="event__awayParticipant">Bayern</div>
            <div class="event__time">20:30</div>
          </div>
        </div>
      </div>
    </div>
  `);
  const matches = scrapeMatches(FUTURE);
  expect(matches).toHaveLength(1);
  expect(matches[0].homeTeam).toBe('Dortmund');
});

test('возвращает пустой массив, когда нет предстоящих матчей', () => {
  buildDOM('<div class="leagues--live"></div>');
  expect(scrapeMatches(FUTURE)).toEqual([]);
});

test('возвращает пустой массив, когда leagues--live отсутствует в DOM', () => {
  buildDOM('<div></div>');
  expect(scrapeMatches(FUTURE)).toEqual([]);
});

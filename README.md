# Flashscore Add to Calendar

A small Chrome extension that adds a 📅 button next to every upcoming football match on [flashscore.info](https://www.flashscore.info), so you can add it to Google Calendar in one click.

🇬🇧 [English](#english) · 🇷🇺 [Русский](#русский)

---

## English

### What it does

On your Flashscore favorites page, on tournament/league pages, and on a team's fixtures page, this extension injects a 📅 icon next to every upcoming match. Click it and Google Calendar opens in a new tab with the event pre-filled:

- **Title**: `{tournament}: {home team} — {away team}`
- **Time**: converted to UTC, displayed in your local timezone by Google Calendar
- **Duration**: 2 hours
- **Description**: link back to the Flashscore match page

After clicking, the icon turns into ✅ for two seconds as confirmation, then reverts to 📅.

### Problem it solves

Following several teams and leagues on Flashscore means checking the fixtures list manually and copy-pasting match details into a calendar one by one. With several matches a week across different competitions, this is tedious and matches get missed. This extension turns "add to calendar" into a single click, right where you're already looking at the match.

### Supported pages

- `flashscore.info/favorites/` — your favorited matches
- `flashscore.info/football/<country>/<competition>/` — tournament and league pages
- `flashscore.info/team/<team>/<id>/fixtures/` — a team's own fixtures page

Only **upcoming** matches (kickoff time in the future) get a button. Flashscore's page updates dynamically as you scroll or switch tabs — the extension watches for that and injects buttons on the fly, no reload needed.

### Installation

This is not published on the Chrome Web Store — it's installed as an unpacked extension, which just means loading the source folder directly into Chrome.

1. **Get the code**
   - Either clone it: `git clone https://github.com/frizzyTAIM/flashscore-add-to-cal-extension.git`
   - Or download it as a ZIP from GitHub (`Code` → `Download ZIP`) and unzip it somewhere.
2. **Open the extensions page** in Chrome: go to `chrome://extensions`.
3. **Turn on Developer mode** — toggle in the top-right corner of that page.
4. Click **Load unpacked**, and select the folder you just cloned/unzipped (the one that contains `manifest.json`).
5. The extension is now active. Go to any of the [supported pages](#supported-pages) above and you should see 📅 icons appear next to upcoming matches.

No account, no API keys, no configuration needed — it just opens a pre-filled Google Calendar link, so you'll need to be logged into a Google account in that browser for the "Save" step to work.

### Development

```bash
npm install
npm test
```

Tests run with Jest + jsdom and cover the pure logic modules (calendar URL building, DOM scraping, button injection) using mock HTML — no network access or real browser needed. See [CLAUDE.md](CLAUDE.md) for the full architecture breakdown.

---

## Русский

### Что делает

На странице избранного Flashscore, на страницах турниров/лиг и на странице расписания конкретной команды расширение добавляет иконку 📅 рядом с каждым предстоящим матчем. Клик по ней открывает Google Calendar в новой вкладке с уже заполненным событием:

- **Название**: `{турнир}: {команда хозяев} — {команда гостей}`
- **Время**: конвертируется в UTC, Google Calendar сам отображает его в вашем локальном часовом поясе
- **Длительность**: 2 часа
- **Описание**: ссылка на страницу матча на Flashscore

После клика иконка на две секунды превращается в ✅ в качестве подтверждения, затем возвращается обратно в 📅.

### Какую проблему решает

Если вы следите за несколькими командами и лигами на Flashscore, приходится вручную открывать список матчей и по одному переносить их в календарь. При 4-5 матчах в неделю по разным турнирам это утомительно, и часть матчей теряется. Расширение сводит "добавить в календарь" к одному клику прямо там, где вы уже смотрите на матч.

### Поддерживаемые страницы

- `flashscore.info/favorites/` — избранные матчи
- `flashscore.info/football/<страна>/<турнир>/` — страницы турниров и лиг
- `flashscore.info/team/<команда>/<id>/fixtures/` — страница расписания конкретной команды

Кнопка появляется только у **предстоящих** матчей (время начала ещё не наступило). Flashscore обновляет содержимое страницы динамически при скролле и переключении вкладок — расширение это отслеживает и добавляет кнопки на лету, без перезагрузки страницы.

### Установка

Расширение не опубликовано в Chrome Web Store — оно устанавливается как "unpacked extension", то есть папка с исходным кодом просто загружается в Chrome напрямую.

1. **Скачайте код**
   - Клонируйте репозиторий: `git clone https://github.com/frizzyTAIM/flashscore-add-to-cal-extension.git`
   - Либо скачайте ZIP-архив на GitHub (`Code` → `Download ZIP`) и распакуйте его.
2. **Откройте страницу расширений** в Chrome: `chrome://extensions`.
3. **Включите режим разработчика** — переключатель в правом верхнем углу этой страницы.
4. Нажмите **Load unpacked** ("Загрузить распакованное расширение") и выберите папку, которую вы склонировали/распаковали (ту, где лежит `manifest.json`).
5. Расширение активно. Откройте любую из [поддерживаемых страниц](#поддерживаемые-страницы) — рядом с предстоящими матчами появятся иконки 📅.

Никаких аккаунтов, API-ключей и настроек не требуется — расширение просто открывает предзаполненную ссылку Google Calendar, поэтому для шага "Сохранить" нужно быть залогиненным в аккаунт Google в этом браузере.

### Разработка

```bash
npm install
npm test
```

Тесты запускаются через Jest + jsdom и покрывают чистую логику модулей (сборка ссылки календаря, парсинг DOM, инъекция кнопок) на моках HTML — без сети и реального браузера. Полное описание архитектуры — в [CLAUDE.md](CLAUDE.md).

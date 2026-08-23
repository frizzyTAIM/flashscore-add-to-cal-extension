function initObserver() {
  function run() {
    injectButtons(scrapeMatches());
  }

  run();

  // Observe document.body rather than a specific match-list container: Flashscore is a
  // client-rendered SPA that unmounts/remounts that container on soft navigation between
  // pages (e.g. switching teams), which would detach an observer watching it directly and
  // leave it silently dead until a manual reload. document.body itself is never replaced.
  const observer = new MutationObserver(run);
  observer.observe(document.body, { childList: true, subtree: true });

  // Chrome restores a page from the back/forward cache without re-running content
  // scripts, so navigating "back" to a previously-visited Flashscore page can otherwise
  // show none of our buttons until a manual reload. Re-run on that specific case.
  window.addEventListener('pageshow', (e) => { if (e.persisted) run(); });
}

function initObserver() {
  function run() {
    injectButtons(scrapeMatches());
  }

  run();

  const container =
    document.querySelector('#live-table') ||
    document.querySelector('.leagues--live') ||
    document.body;

  const observer = new MutationObserver(run);
  observer.observe(container, { childList: true, subtree: true });
}

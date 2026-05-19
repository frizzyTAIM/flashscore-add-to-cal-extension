function injectButtons(matches) {
  for (const match of matches) {
    const row = match.element;
    if (!row || row.dataset.calInjected) continue;

    row.dataset.calInjected = '1';
    const url = buildCalendarUrl(match);

    let btn = row.querySelector('.event__icon--audio');
    if (btn) {
      // Modify the existing audio icon in-place to keep its CSS grid position
      btn.innerHTML = '📅';
      btn.classList.add('event__icon--cal');
      btn.title = 'Add to Google Calendar';
      btn.style.cursor = 'pointer';
      btn.removeAttribute('aria-label');
      btn.removeAttribute('aria-describedby');
    } else {
      // No headphones icon — create button with same classes for consistent placement
      btn = document.createElement('a');
      btn.className = 'event__icon event__icon--audio event__icon--cal';
      btn.title = 'Add to Google Calendar';
      btn.innerHTML = '📅';
      btn.style.cursor = 'pointer';
      row.appendChild(btn);
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open(url, '_blank');
      btn.innerHTML = '✅';
      setTimeout(() => { btn.innerHTML = '📅'; }, 2000);
    });
  }
}

if (typeof module !== 'undefined') module.exports = { injectButtons };

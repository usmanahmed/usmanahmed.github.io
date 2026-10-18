// Theme toggle (remembers choice per browser)
(function () {
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem('theme');
    if (saved) root.dataset.theme = saved;
  } catch (e) {}
  document.getElementById('theme').addEventListener('click', () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  });
  document.getElementById('year').textContent = new Date().getFullYear();
})();

// Load public repos live from GitHub; keep the static cards if the request fails.
(async function () {
  const USER = 'usmanahmed';
  const SKIP = [USER + '.github.io'];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Fallback descriptions for repos that have none on GitHub
  const blurbs = {};
  document.querySelectorAll('#repos .project').forEach(card => {
    blurbs[card.querySelector('h3').textContent.trim()] = card.outerHTML;
  });

  try {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?sort=updated&per_page=100`);
    if (!res.ok) return;
    const repos = (await res.json()).filter(r => !r.fork && !r.archived && !SKIP.includes(r.name));
    if (!repos.length) return;

    document.getElementById('repos').innerHTML = repos.map(r => {
      if (!r.description && blurbs[r.name]) return blurbs[r.name];
      const tags = [r.language, ...(r.topics || [])].filter(Boolean).slice(0, 4);
      return `
        <article class="card project">
          <h3><a href="${esc(r.html_url)}">${esc(r.name)}</a></h3>
          <p>${esc(r.description || 'No description yet.')}</p>
          ${tags.length ? `<ul class="tags small">${tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
          ${r.homepage ? `<a class="mono link" href="${esc(r.homepage)}">Live site →</a>` : ''}
        </article>`;
    }).join('');
  } catch (e) { /* keep static fallback */ }
})();

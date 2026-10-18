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

// Load public repos live from GitHub; keep the static list if the request fails.
(async function () {
  const USER = 'usmanahmed';
  const SKIP = [USER + '.github.io'];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const list = document.getElementById('repos');
  // Static blurbs for repos that have no description on GitHub
  const blurbs = {};
  list.querySelectorAll('li').forEach(li => { blurbs[li.querySelector('a').textContent.trim()] = li.querySelector('span').textContent; });

  try {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?sort=updated&per_page=100`);
    if (!res.ok) return;
    const repos = (await res.json()).filter(r => !r.fork && !r.archived && !SKIP.includes(r.name));
    if (!repos.length) return;
    list.innerHTML = repos.slice(0, 5).map(r => `
      <li><a href="${esc(r.html_url)}">${esc(r.name)}</a><span>${esc(r.description || blurbs[r.name] || r.language || 'Public repository')}</span></li>`).join('');
  } catch (e) { /* keep static fallback */ }
})();

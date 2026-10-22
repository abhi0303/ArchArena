// Applies the saved theme before first paint to avoid a flash of the wrong theme.
// Kept as a static file (not inline) so the Content-Security-Policy can forbid inline scripts.
try {
  var t = JSON.parse(localStorage.getItem('archarena-preferences') || '{}').state?.theme || 'system';
  var dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#0b1020' : '#4f46e5');
} catch (e) {}

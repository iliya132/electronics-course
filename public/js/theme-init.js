try {
  const s = JSON.parse(localStorage.getItem('prefs') || '{}');
  if (['light', 'dark'].includes(s.theme)) document.documentElement.dataset.theme = s.theme;
  if ([16, 18, 20, 22].includes(s.font_size)) {
    document.documentElement.style.setProperty('--font-size', s.font_size + 'px');
  }
} catch {}

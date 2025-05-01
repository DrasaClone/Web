const themes = ['light','dark','ocean','forest','sunset', /*…*/];
function applyTheme(name) {
  document.documentElement.setAttribute('data-theme', name);
  localStorage.setItem('theme', name);
}
document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('theme-selector');
  themes.forEach(t => sel.add(new Option(t, t)));
  const saved = localStorage.getItem('theme') || 'light';
  sel.value = saved; applyTheme(saved);
  sel.onchange = () => applyTheme(sel.value);
  // Custom RGB
  const [r,g,b] = ['rgb-r','rgb-g','rgb-b'].map(id => document.getElementById(id));
  const stored = localStorage.getItem('customPrimary');
  if (stored) document.documentElement.style.setProperty('--primary', stored);
  function applyCustom() {
    const c = `rgb(${r.value},${g.value},${b.value})`;
    document.documentElement.style.setProperty('--primary', c);
    localStorage.setItem('customPrimary', c);
  }
  [r,g,b].forEach(i => i.oninput = applyCustom);
});

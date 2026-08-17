export const THEME = {
  bg: '#171b22',
  surface: '#1e2430',
  surface2: '#252c3a',
  border: '#333d4d',
  text: '#e7eaf0',
  textMuted: '#8992a3',
  accent: '#d9a441',
  accentDark: '#241a05',
  danger: '#d9695f',
  success: '#6fbf7b',
};

export function money(n) {
  const v = Math.round(Number(n) || 0);
  return 'Rs ' + v.toLocaleString('en-PK');
}

export function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

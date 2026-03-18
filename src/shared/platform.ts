export const isMac = /mac/i.test(navigator.userAgent);
export const mod = isMac ? '\u2318' : 'Ctrl+';
export const alt = isMac ? '\u2325' : 'Alt+';
export const shift = isMac ? '\u21E7' : 'Shift+';

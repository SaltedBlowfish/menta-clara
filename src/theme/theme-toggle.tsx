import './theme-toggle.css';
import { Tooltip } from '../shared/tooltip';
import { useTheme } from './use-theme';

function SunIcon() {
  return (
    <svg
      fill="none"
      height="20"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 20 20"
      width="20"
    >
      <circle cx="10" cy="10" r="4" />
      <line x1="10" x2="10" y1="1" y2="3" />
      <line x1="10" x2="10" y1="17" y2="19" />
      <line x1="1" x2="3" y1="10" y2="10" />
      <line x1="17" x2="19" y1="10" y2="10" />
      <line x1="3.64" x2="5.05" y1="3.64" y2="5.05" />
      <line x1="14.95" x2="16.36" y1="14.95" y2="16.36" />
      <line x1="3.64" x2="5.05" y1="16.36" y2="14.95" />
      <line x1="14.95" x2="16.36" y1="5.05" y2="3.64" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      fill="none"
      height="20"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 20 20"
      width="20"
    >
      <path d="M17 10a7 7 0 1 1-7-7 5.25 5.25 0 0 0 7 7Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  const label = theme === 'light' ? 'Dark mode' : 'Light mode';

  return (
    <Tooltip label={label}>
      <button
        aria-label={`Switch to ${label.toLowerCase()}`}
        className="theme-toggle"
        onClick={toggle}
        type="button"
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>
    </Tooltip>
  );
}

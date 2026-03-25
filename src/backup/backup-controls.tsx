import { BACKUP_TEMPLATES } from './backup-templates';

interface BackupControlsProps {
  enabled: boolean;
  intervalMinutes: number;
  running: boolean;
  onSelectTemplate: (code: string) => void;
  onToggleEnabled: (enabled: boolean) => void;
  onChangeInterval: (minutes: number) => void;
  onRunNow: () => void;
}

export function BackupControls(props: BackupControlsProps) {
  const { enabled, intervalMinutes, running, onSelectTemplate, onToggleEnabled, onChangeInterval, onRunNow } = props;

  return (
    <div className="backup-controls">
      <div className="backup-controls-row">
        <select
          className="backup-select"
          defaultValue=""
          onChange={(e) => {
            const tpl = BACKUP_TEMPLATES.find((t) => t.label === e.target.value);
            if (tpl) onSelectTemplate(tpl.code);
            e.target.value = '';
          }}
        >
          <option disabled value="">Load template...</option>
          {BACKUP_TEMPLATES.map((t) => (
            <option key={t.label} value={t.label}>{t.label}</option>
          ))}
        </select>

        <select
          className="backup-select"
          onChange={(e) => onChangeInterval(Number(e.target.value))}
          value={intervalMinutes}
        >
          <option value={0}>Manual only</option>
          <option value={30}>Every 30 min</option>
          <option value={60}>Every hour</option>
          <option value={360}>Every 6 hours</option>
          <option value={1440}>Every day</option>
        </select>
      </div>

      <div className="backup-controls-row">
        <label className="backup-toggle">
          <input
            checked={enabled}
            onChange={(e) => onToggleEnabled(e.target.checked)}
            type="checkbox"
          />
          <span>Enabled</span>
        </label>

        <button
          className="btn btn-secondary"
          disabled={running}
          onClick={onRunNow}
          type="button"
        >
          {running ? 'Running...' : 'Run now'}
        </button>
      </div>
    </div>
  );
}

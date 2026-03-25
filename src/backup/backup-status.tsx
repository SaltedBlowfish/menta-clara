interface BackupStatusProps {
  lastRunAt: number | null;
  lastRunOk: boolean | null;
  lastRunError: string | null;
}

export function BackupStatus(props: BackupStatusProps) {
  const { lastRunAt, lastRunOk, lastRunError } = props;

  if (lastRunAt === null) return null;

  const time = new Date(lastRunAt).toLocaleTimeString();

  return (
    <div className="backup-status">
      <span className={lastRunOk ? 'backup-status-ok' : 'backup-status-err'}>
        {lastRunOk ? 'Success' : 'Failed'} at {time}
      </span>
      {lastRunError && <span className="backup-status-error">{lastRunError}</span>}
    </div>
  );
}

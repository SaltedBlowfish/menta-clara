interface StorageWarningProps {
  message: string;
}

export function StorageWarning(props: StorageWarningProps) {
  const { message } = props;

  return (
    <div className="storage-warning" role="alert">
      {message}
    </div>
  );
}

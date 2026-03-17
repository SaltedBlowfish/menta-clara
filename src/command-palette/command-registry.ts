export interface PaletteCommand {
  action: () => void;
  id: string;
  keywords: ReadonlyArray<string>;
  name: string;
}

export function filterCommands(
  commands: ReadonlyArray<PaletteCommand>,
  query: string,
): ReadonlyArray<PaletteCommand> {
  const lower = query.toLowerCase();
  return commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(lower) ||
      cmd.keywords.some((kw) => kw.toLowerCase().includes(lower)),
  );
}

export function getSelectedOneNodeId(selectedNodeIds: string[]): string | null {
  if (selectedNodeIds.length === 1) {
    return selectedNodeIds[0];
  }
  return null;
}

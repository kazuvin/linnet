export function findDropZoneAt(x: number, y: number, accept: string): string | null {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;

  const dropZone = (el as HTMLElement).closest?.("[data-drop-zone]");
  if (!dropZone) return null;

  const acceptAttr = dropZone.getAttribute("data-drop-accept");
  if (acceptAttr !== accept) return null;

  return dropZone.getAttribute("data-drop-zone");
}

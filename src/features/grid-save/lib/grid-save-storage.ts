import type { GridPreset } from "./types";

const STORAGE_KEY = "linnet:grid-presets";

export function getPresets(): GridPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as GridPreset[];
  } catch {
    return [];
  }
}

export function savePreset(preset: GridPreset): void {
  const presets = getPresets();
  presets.push(preset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export function deletePreset(id: string): void {
  const presets = getPresets().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

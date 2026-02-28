"use client";

import { useSyncExternalStore } from "react";

export type ToastVariant = "success" | "error";

export type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  exiting: boolean;
};

const EXIT_ANIMATION_MS = 300;

let toasts: Toast[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Toast[] {
  return toasts;
}

function setToasts(next: Toast[]) {
  toasts = next;
  emit();
}

function removeAfterAnimation(id: string) {
  setTimeout(() => {
    setToasts(toasts.filter((t) => t.id !== id));
  }, EXIT_ANIMATION_MS);
}

export function addToast(message: string, variant: ToastVariant = "success") {
  const id = crypto.randomUUID();
  setToasts([...toasts, { id, message, variant, exiting: false }]);
  setTimeout(() => {
    setToasts(toasts.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    removeAfterAnimation(id);
  }, 3000);
}

export function dismissToast(id: string) {
  setToasts(toasts.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
  removeAfterAnimation(id);
}

export function getToasts(): Toast[] {
  return toasts;
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function _resetToastStoreForTesting(): void {
  toasts = [];
  emit();
}

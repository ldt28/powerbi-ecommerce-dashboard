import { useEffect } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  handler: () => void;
  description?: string;
}

/**
 * Hook for managing global keyboard shortcuts
 * Usage: useKeyboardShortcuts([
 *   { key: "k", metaKey: true, handler: () => openSearch() },
 *   { key: "Escape", handler: () => closeModal() }
 * ])
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : true;
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : true;
        const metaMatches = shortcut.metaKey ? event.metaKey : true;
        const altMatches = shortcut.altKey ? event.altKey : true;

        if (keyMatches && ctrlMatches && shiftMatches && metaMatches && altMatches) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

/**
 * Common keyboard shortcuts
 */
export const COMMON_SHORTCUTS = {
  SEARCH: { key: "k", metaKey: true, description: "⌘K - Open search" },
  SEARCH_CTRL: { key: "k", ctrlKey: true, description: "Ctrl+K - Open search" },
  CLOSE: { key: "Escape", description: "Esc - Close dialog/modal" },
  SAVE: { key: "s", metaKey: true, description: "⌘S - Save" },
  SAVE_CTRL: { key: "s", ctrlKey: true, description: "Ctrl+S - Save" },
  REFRESH: { key: "r", metaKey: true, description: "⌘R - Refresh" },
  REFRESH_CTRL: { key: "r", ctrlKey: true, description: "Ctrl+R - Refresh" },
  BACK: { key: "b", metaKey: true, description: "⌘B - Go back" },
  BACK_CTRL: { key: "b", ctrlKey: true, description: "Ctrl+B - Go back" },
  HELP: { key: "?", shiftKey: true, description: "Shift+? - Show help" },
};

import { useEffect } from 'react';
import { useEditor } from './store';

export const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: '⌘/Ctrl + Z', action: 'Undo' },
  { keys: '⌘/Ctrl + Shift + Z  or  Ctrl + Y', action: 'Redo' },
  { keys: '⌘/Ctrl + D', action: 'Duplicate selection' },
  { keys: '⌘/Ctrl + G', action: 'Group selection into a section' },
  { keys: '⌘/Ctrl + S', action: 'Save now' },
  { keys: 'Delete / Backspace', action: 'Delete selection' },
  { keys: 'Shift + drag', action: 'Select an area' },
  { keys: 'Shift + click', action: 'Add to selection' },
  { keys: 'Escape', action: 'Clear selection' },
  { keys: '?', action: 'Show shortcuts' },
];

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

export function useKeyboardShortcuts({ onSave, onHelp }: { onSave: () => void; onHelp: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      const s = useEditor.getState();
      if (mod && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        s.undo();
      } else if ((mod && key === 'z' && e.shiftKey) || (e.ctrlKey && key === 'y')) {
        e.preventDefault();
        s.redo();
      } else if (mod && key === 'd') {
        e.preventDefault();
        s.duplicateSelected();
      } else if (mod && key === 'g') {
        e.preventDefault();
        s.groupSelected();
      } else if (mod && key === 's') {
        e.preventDefault();
        onSave();
      } else if (key === 'escape') {
        s.selectOnly([]);
      } else if (e.key === '?') {
        e.preventDefault();
        onHelp();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSave, onHelp]);
}

import { useEffect, useRef } from "react";
import '../../styles/system.css';
import { log, warn } from "../../shared/Log";

const BROWSER_SHORTCUTS = [
  "Ctrl+Shift+J",
  "Ctrl+Shift+I",
  "F12", "F11",
];

const TEXT_SHORTCUTS = [
  "Ctrl+C", "Ctrl+V", "Ctrl+X", "Ctrl+Shift+V",
  "Ctrl+Insert", "Shift+Insert", "Shift+Delete",
  "Ctrl+A", "Ctrl+Shift+A",
  "Backspace", "Delete",
  "Tab", "Shift+Tab",
  "Enter", "Shift+Enter",
  "Ctrl+Z", "Ctrl+Y", "Ctrl+Shift+Z",
  "Ctrl+Backspace", "Ctrl+Delete",
  "Alt+ArrowLeft", "Alt+ArrowRight",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown", "Home", "End",
  "Ctrl+ArrowUp", "Ctrl+ArrowDown", "Ctrl+ArrowLeft", "Ctrl+ArrowRight", "Ctrl+PageUp", "Ctrl+PageDown", "Ctrl+Home", "Ctrl+End",
  "Shift+ArrowUp", "Shift+ArrowDown", "Shift+ArrowLeft", "Shift+ArrowRight", "Shift+PageUp", "Shift+PageDown", "Shift+Home", "Shift+End",
  "Ctrl+Shift+ArrowUp", "Ctrl+Shift+ArrowDown", "Ctrl+Shift+ArrowLeft", "Ctrl+Shift+ArrowRight", "Ctrl+Shift+PageUp", "Ctrl+Shift+PageDown", "Ctrl+Shift+Home", "Ctrl+Shift+End",
  "Escape", "Insert",
  "Meta+C", "Meta+V", "Meta+X", "Meta+A",
  "Meta+Z", "Meta+Shift+Z",
  "Meta+ArrowLeft", "Meta+ArrowRight",
  "Meta+ArrowUp", "Meta+ArrowDown",
  "Meta+Backspace",
  "Alt+ArrowLeft", "Alt+ArrowRight",
  "Alt+Shift+ArrowLeft", "Alt+Shift+ArrowRight",
  "Alt+Backspace", "Alt+Delete",
];

function isBrowserShortcutAllowed(shortcut, target) {
  if (BROWSER_SHORTCUTS.includes(shortcut)) {
    return true;
  } else if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
    if (TEXT_SHORTCUTS.includes(shortcut)) {
      return true;
    } else if (shortcut.length === 1 || shortcut.startsWith("Shift+") && shortcut.length === 7) {
      return true;
    }
  }
  return false;
}

export default function System() {
  const ShortcutRegistryRef = useRef(new Map());

  function handleKey(event) {
    const MODIFIER_MAP = {
      ['Control']: 'Ctrl',
      ['Meta']: 'Win',
    }

    const modifiers = [];
    const registerModifier = (flag, key) => { if (flag && event.key !== key) modifiers.push(MODIFIER_MAP[key] || key) };

    registerModifier(event.ctrlKey, 'Control');
    registerModifier(event.altKey, 'Alt');
    registerModifier(event.shiftKey, 'Shift');
    registerModifier(event.metaKey, 'Meta');

    const key = event.key;
    const normalized = [...modifiers, MODIFIER_MAP[key] || (key.length === 1 ? key.toUpperCase() : key)].join('+');

    const registry = ShortcutRegistryRef.current;
    const handler = registry.get(normalized);

    if (!isBrowserShortcutAllowed(normalized, event.target)) event.preventDefault();

    if (handler) {
      log(normalized);
      handler(event);
    }
  }

  function registerGlobalShortcut(shortcut, handler) {
    const registry = ShortcutRegistryRef.current;
    if (registry.has(shortcut)) warn(`Warning: handler for'${shortcut}' already registered.`);

    registry.set(shortcut, handler);
  }

  function clearGlobalShortcut(shortcut) {
    const registry = ShortcutRegistryRef.current;
    if (registry.has(shortcut)) registry.delete(shortcut);
  }

  useEffect(() => {
    registerGlobalShortcut("Ctrl+R", () => pm.start('run'));
    registerGlobalShortcut("Ctrl+E", () => pm.start('explorer'));

    registerGlobalShortcut("Ctrl+D", () => console.log(pm.list().map(p => `[${p.pid}] ${p.windows.length} ${p.name || ''}`).join('\n')));

    registerGlobalShortcut("F5", () => window.location.reload());

    document.addEventListener('keydown', handleKey, false);
    return () => {
      document.removeEventListener('keydown', handleKey, false);
      ShortcutRegistryRef.current.clear();
    };
  }, []);
}

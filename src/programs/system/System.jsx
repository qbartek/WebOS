import { useEffect, useRef } from "react";
import '../../styles/system.css';
import { log, warn } from "../../shared/Log";

const BROWSER_SHORTCUTS = [
  "Ctrl+Shift+J",
  "Ctrl+Shift+I",
  "F12",
];

export default function System() {
  const ShortcutRegistryRef = useRef(new Map());

  function handleKey(event) {
    const target = event.target;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

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
    if (!BROWSER_SHORTCUTS.includes(normalized)) 
      event.preventDefault();

    const registry = ShortcutRegistryRef.current;
    const handler = registry.get(normalized);
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
    registerGlobalShortcut("Ctrl+R", () => {
      pm.start('run');
    })

    registerGlobalShortcut("Ctrl+D", () => console.log(pm.list().map(p => `[${p.pid}] ${p.windows.length} ${p.name || ''}`).join('\n')));

    registerGlobalShortcut("F5", () => window.location.reload());

    document.addEventListener('keydown', handleKey, false);
    return () => {
      document.removeEventListener('keydown', handleKey, false);
      ShortcutRegistryRef.current.clear();
    };
  }, []);
}

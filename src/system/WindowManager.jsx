import { useEffect } from "react";
import { log } from "../shared/Log";
import Window from "./Window";

export function useWindow(wm, window, deps = []) {
  useEffect(() => {
    const handle = wm.add(window);
    return handle.close;
  }, deps);
}

export const DIALOG = {
  ERROR: 1,
}

export function showDialog(wm, type, title, content) {
  if (type === DIALOG.ERROR) content = "Error: " + content;

  wm.add({
    title,
    comp: <>
      {content}
    </>
  });
}

export function useWindowManager(pm) {
  function windowMethods(pid, id) {
    return {
      close: () => pm._setWindows(pid, ws => ws.filter(w => w.id !== id)),
      update: (patch) => pm._setWindows(pid, ws => ws.map(w => w.id === id ? { ...w, ...patch } : w)),
      focus: () => focus(id),
    }
  }

  const _forPID = (pid) => ({
    add: (window) => {
      const id = add(pid, window);
      return windowMethods(pid, id);
    },
    get: (id) => {
      return windowMethods(pid, id);
    }
  });

  const render = () => {
    return <div className='window-container'>
      {getWindows().map(window =>
        <Window key={window.id} window={window} wm={_forPID(window.parent)} >
          {window.comp}
        </Window>)}
    </div>
  }

  const focus = (windowUUID) => {
    const windows = getWindows();
    const focused = windows.find(w => w.id === windowUUID);
    if (!focused) return;
    if (focused.focused && !focused.min) return;
    log(`[${focused.parent}] focus ${focused.id}`);

    pm.list().forEach(p => pm._setWindows(p.pid, ws => ws.map(w => {
      if (w.z > focused.z) return { ...w, z: w.z - 1, focused: false };
      if (w.id === windowUUID) return { ...w, z: windows.length - 1, min: false, focused: true };
      return { ...w, focused: false };
    })));
  }

  function getWindows() {
    let windows = [];
    pm.list().forEach(p => {
      p.windows.forEach(window => {
        window.parent = p.pid;
        windows.push(window);
      })
    })
    return windows;
  }

  const list = getWindows;

  const add = (pid, window) => {
    const process = pm.get(pid);

    const windowUUID = crypto.randomUUID();
    log(`[${pid}] ${process.name ?? pid} - ${windowUUID}`);

    const newWindow = {
      x: 100,
      y: 200,
      focused: true,
      ...window,
      z: list().length,
    };
    newWindow.id = windowUUID;

    pm.list().forEach(p => pm._setWindows(p.pid, windows => windows.map(w => ({ ...w, focused: false }))));
    pm._setWindows(pid, windows => [...windows, newWindow]);

    return windowUUID;
  };

  return { render, list, add, _forPID, focus }
}

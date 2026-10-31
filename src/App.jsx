import { useEffect, useRef, useState } from 'react'
import { useProcessManager } from './system/ProcessManager.jsx';
import { useWindowManager } from './system/WindowManager.jsx';
import System from './programs/system/System.jsx';
import Desktop from './programs/system/Desktop.jsx';
import TaskBar from './programs/system/TaskBar.jsx';
import Run from './programs/system/Run.jsx';
import Explorer from './programs/system/Explorer.jsx';
import Notepad from './programs/Notepad.jsx';
import Welcome from './programs/Welcome.jsx';
import { useFileSystem } from './system/FileSystem.jsx';
import Reset from './programs/system/Reset.jsx';

const programs = {
  ['system']: System,
  ['desktop']: Desktop,
  ['taskbar']: TaskBar,
  ['run']: Run,
  ['explorer']: Explorer,
  ['notepad']: Notepad,
  ['welcome']: Welcome,
  ['reset']: Reset,
};

export default function App() {
  let started = useRef(false);
  const [fsReady, setFsReady] = useState(false);

  const pm = useProcessManager(programs);
  const wm = useWindowManager(pm);
  const fs = useFileSystem(setFsReady);

  // Start sequence

  function startup() {
    if (started.current == true) return;
    started.current = true;

    window.pm = pm;
    window.wm = wm;
    window.fs = fs;

    let autostart = [];
    autostart.push('system');
    autostart.push('desktop');
    autostart.push('taskbar');

    autostart.forEach(p => pm.start(p));
  }

  useEffect(() => {
    startup();
  }, []);

  return (
    <>
      {fsReady && pm.run()}
      {fsReady && wm.render()}
    </>
  )
}

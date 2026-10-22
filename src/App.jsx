import { useEffect, useRef } from 'react'
import { useProcessManager } from './system/ProcessManager.jsx';
import { useWindowManager } from './system/WindowManager.jsx';
import System from './programs/system/System.jsx';
import Desktop from './programs/system/Desktop.jsx';
import TaskBar from './programs/system/TaskBar.jsx';
import Run from './programs/system/Run.jsx';
import Notepad from './programs/Notepad.jsx';
import Welcome from './programs/Welcome.jsx';

const programs = {
  ['system']: System,
  ['desktop']: Desktop,
  ['taskbar']: TaskBar,
  ['run']: Run,
  ['notepad']: Notepad,
  ['welcome']: Welcome,
};

const AUTOSTART = ['welcome'];

export default function App() {
  let started = useRef(false);
  const pm = useProcessManager(programs);
  const wm = useWindowManager(pm);

  // Start sequence

  function startup() {
    if (started.current == true) return;
    started.current = true;

    window.pm = pm;
    window.wm = wm;

    let autostart = [];
    autostart.push('system');
    autostart.push('desktop');
    autostart.push('taskbar');
    AUTOSTART.forEach(p => autostart.push(p));

    autostart.forEach(p => pm.start(p));
  }

  useEffect(() => {
    startup();
  }, []);

  return (
    <>

      {pm.run()}
      {wm.render()}

    </>
  )
}

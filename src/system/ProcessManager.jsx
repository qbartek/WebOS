import { useCallback, useRef, useState } from "react";
import { log, warn } from "../shared/Log";
import { getProgramFromExtension } from "../shared/files";

function Process({ children }) {
  return <>
    {children}
  </>;
}

export function useProcessManager(programs) {
  let [counter, setCounter] = useState(8000);
  let [processes, setProcesses] = useState([]);
  const processesRef = useRef(processes);
  processesRef.current = processes;

  function nextPid() {
    setCounter(++counter);
    return counter;
  }

  const startProcess = ({ name, app, args }) => {
    const pid = nextPid();
    log(`[${pid}] ${name ?? ''}`);

    const process = {
      name,
      pid,
      app,
      args,
      windows: []
    };

    setProcesses(processes => [...processes, process]);

    return pid;
  };

  const start = useCallback(async (name, args=[]) => {
    if (programs[name]) {
      return startProcess({ name, app: programs[name], args });
    }

    if (window.fs) {
      if (!name.endsWith('/')) {
        const file = await fs.readFile(name);
        if (file && file.startsWith('#!')) {
          return await start(file.slice(2));
        }
        if (file) return await start(getProgramFromExtension(name), [name]);
      } else {
        return await start(getProgramFromExtension(name), [name]);
      }
    }

    warn(`'${name}' is not recognized as an operable program or file.`);
    return `'${name}' is not recognized as an operable program or file.`;
  })

  const kill = useCallback(pid => {
    setProcesses(ps => ps.filter((p) => !(pid === p.pid)));
  });

  const list = useCallback(() => {
    return processesRef.current;
  });

  const get = useCallback((pid) => {
    return processesRef.current.filter(p => p.pid === pid)[0];
  })

  const getPid = useCallback((name) => {
    return processesRef.current.filter(p => p.name == name).map(p => p.pid);
  })

  const run = useCallback(() => {
    return processes.map((process) => {
      return <Process pid={process.pid} key={process.pid} name={process.name}>
        {process.app && <process.app pid={process.pid} window={wm._forPID(process.pid)} args={process.args} />}
      </Process>
    })
  });

  const _setWindows = useCallback((pid, update) => {
    setProcesses(ps => ps.map(p => {
      if (p.pid === pid) {
        const newValue = update(p.windows);

        if (p.windows.length > 0 && newValue.length === 0 && !['system', 'desktop', 'taskbar'].includes(p.name)) {
          setTimeout(() => {
            if (get(pid)?.windows.length === 0) {
              log(`[${pid}] cleanup`)
              kill(pid);
            }
          }, 1000)
        }

        return { ...p, windows: newValue }
      }
      return p;
    }));
  })

  return { start, kill, list, get, getPid, run, _setWindows }
}

import { useCallback, useRef, useState } from "react";
import { log, warn } from "../shared/Log";

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

  const startProcess = ({ name, app }) => {
    const pid = nextPid();
    log(`[${pid}] ${name ?? ''}`);

    const process = {
      name,
      pid,
      app,
      windows: []
    };

    setProcesses(processes => [...processes, process]);

    return pid;
  };

  const start = useCallback((name, args) => {
    if (programs[name]) {
      return startProcess({ name, app: programs[name] });
    } else {
      warn(`'${name}' is not recognized as an operable program.`);
      return `'${name}' is not recognized as an operable program.`;
    }
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
        {process.app && <process.app pid={process.pid} window={wm._forPID(process.pid)} />}
      </Process>
    })
  });

  const _setWindows = useCallback((pid, update) => {
    setProcesses(ps => ps.map(p => {
      if (p.pid === pid) {
        const newValue = update(p.windows);

        if (p.windows.length > 0 && newValue.length === 0) {
          setTimeout(() => {
            if (get(pid).windows.length === 0) {
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

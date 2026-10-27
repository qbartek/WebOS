import { useEffect, useState } from 'react';

export default function TaskBar() {
  const [time, setTime] = useState(0);
  const [timeString, setTimeString] = useState('00:00');

  useEffect(() => {
    const now = new Date();
    const timeout = setTimeout(() => {
      setTimeString(now.toLocaleTimeString());
      setTime(now);
    }, 100);

    return () => clearTimeout(timeout);
  }, [time]);

  const DEFAULT_ICON = "# ";

  function getWindowIcon(window) {
    return <div className='taskbar-item' key={window.id} id={'bar-' + window.id} onClick={() => wm.focus(window.id)}>
      {window.icon ? <img className='taskbar-icon' src={"/src/assets/" + window.icon}></img> : DEFAULT_ICON}
      {window.title}
    </div>
  }

  return (
    <>
      <div className='taskbar'>
        <div className='taskbar-head'>WebOS</div>
        <div className='taskbar-item' onClick={() => pm.start('run')}>Start</div>
        <div className='taskbar-body'>{wm.list().map(getWindowIcon)}</div>
        <div className='taskbar-time'>
          {timeString}
        </div>
      </div>
    </>
  )
}

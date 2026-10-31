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

  const DEFAULT_ICON = "";

  function getWindowIcon(window) {
    const handleClick = () => {
      if (window.focused && !window.min) {
        wm.get(window.id, window.parent).update({ min: true });
        return;
      }
      wm.focus(window.id);
    }

    return <div className='taskbar-item' key={window.id} id={'bar-' + window.id} onClick={handleClick}>
      {window.icon ? <img className='taskbar-icon' src={"/src/assets/" + window.icon}></img> : DEFAULT_ICON}
      {window.title}
    </div>
  }

  return (
    <>
      <div className='taskbar'>
        <div className='taskbar-head' onClick={() => pm.start('run')}>WebOS</div>
        <div className='taskbar-body'>{wm.list().map(getWindowIcon)}</div>
        <div className='taskbar-time'>
          {timeString}
        </div>
      </div>
    </>
  )
}

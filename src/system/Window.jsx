import { useState } from 'react';

export default function Window({ wm, children, window: { title, id, z, min } }) {
  const [isDragging, setDragging] = useState(false);
  const [initX, setInitX] = useState();
  const [initY, setInitY] = useState();
  const [initTop, setInitTop] = useState(0);
  const [initLeft, setInitLeft] = useState(0);
  const [x, setX] = useState(100);
  const [y, setY] = useState(190);

  const window = wm.get(id);

  function startDragging(e) {
    e.preventDefault();

    window.focus();

    setInitX(e.clientX);
    setInitY(e.clientY);
    setInitLeft(x);
    setInitTop(y);
    setDragging(true);
  }
  
  function stopDragging(e) {
    e.preventDefault();
    setDragging(false);
  }

  function drag(e) {
    e.preventDefault();
    
    if (!isDragging) return;

    setX(initLeft + e.clientX - initX);
    setY(initTop + e.clientY - initY);
  }

  function w_min() {
    window.update({min: true});
  }

  function w_max() {
    
  }

  function close() {
    window.close();
  }

  const isVisible = !min;

  return (
    <>
      {isVisible && <div className="window" style={{
        top: y + 'px',
        left: x + 'px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: z,
      }}>
        <div className='window-header' onMouseDown={startDragging} onMouseUp={stopDragging} onMouseMove={drag}>
          <span className='window-title'>{title}</span>
          <div className='window-controls'>
            <button className='window-btn' onClick={w_min}>-</button>
            <button className='window-btn' onClick={w_max}>O</button>
            <button className='window-btn' onClick={close}>X</button>
          </div>
        </div>
        <div className='window-content' style={{
          flex: 1,
        }}>
          {children}
        </div>
      </div>}
    </>
  )
}

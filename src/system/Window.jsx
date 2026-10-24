import { useRef, useState } from 'react';

export default function Window({ wm, children, window: { title, id, x, y, z, min } }) {
  const [isDragging, setDragging] = useState(false);

  const dragRef = useRef(null);
  const headerRef = useRef(null);

  const w = wm.get(id);

  function startDragging(e) {
    if (e.button != 0) return;
    if (e.target.closest('.window-controls')) return;

    e.preventDefault();

    dragRef.current = {
      pointerId: e.pointerId,
      initX: e.clientX,
      initY: e.clientY,
      initLeft: x,
      initTop: y,
    };

    headerRef.current?.setPointerCapture(e.pointerId);
  }

  function stopDragging(e) {
    if (dragRef.current?.pointerId !== e.pointerId) return;

    dragRef.current = null;

    if (headerRef.current?.hasPointerCapture(e.pointerId)) {
      headerRef.current.releasePointerCapture(e.pointerId);
    }
  }

  function drag(e) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== e.pointerId) return;

    w.update({
      x: drag.initLeft + e.clientX - drag.initX,
      y: Math.min(window.innerHeight - headerRef.current.offsetHeight, Math.max(0, drag.initTop + e.clientY - drag.initY)),
    });
  }

  function w_min() {
    w.update({ min: true });
  }

  function w_max() {

  }

  function close() {
    w.close();
  }

  const isVisible = !min;

  return (
    <>
      {isVisible && <div
        className="window"
        style={{
          top: y + 'px',
          left: x + 'px',
          zIndex: z,
        }}
      >
        <div
          className='window-header'
          ref={headerRef}
          onPointerDown={startDragging}
          onPointerMove={drag}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        >
          <span className='window-title'>{title}</span>
          <div className='window-controls'>
            <button className='window-btn' onClick={w_min}>-</button>
            <button className='window-btn' onClick={w_max}>O</button>
            <button className='window-btn' onClick={close}>X</button>
          </div>
        </div>
        <div className='window-content'>
          {children}
        </div>
      </div>}
    </>
  )
}

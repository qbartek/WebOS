import { useRef, useState } from 'react';

import windowMinimizeRegular from '/src/assets/system/window-minimize-regular-full.svg';
import windowMaximizeRegular from '/src/assets/system/window-maximize-regular-full.svg';
import windowRestoreRegular from '/src/assets/system/window-restore-regular-full.svg';
import rectangleXmarkRegular from '/src/assets/system/rectangle-xmark-regular-full.svg';

import windowMinimizeSolid from '/src/assets/system/window-minimize-solid-full.svg';
import windowMaximizeSolid from '/src/assets/system/window-maximize-solid-full.svg';
import windowRestoreSolid from '/src/assets/system/window-restore-solid-full.svg';
import rectangleXmarkSolid from '/src/assets/system/rectangle-xmark-solid-full.svg';

export default function Window({ wm, children, window: { title, id, x, y, z, width, height, min, max, focused } }) {
  const dragRef = useRef(null);
  const headerRef = useRef(null);

  const w = wm.get(id);

  function startDragging(e) {
    if (e.button != 0) return;
    if (e.target.closest('.window-controls')) return;

    const newX = max ? (Math.max(0, Math.min(window.innerWidth - width, e.clientX - (width / 2)))) : x;
    const newY = max ? 0 : y;

    w.focus();
    w.update({ max: false, x: newX, y: newY })
    e.preventDefault();

    dragRef.current = {
      pointerId: e.pointerId,
      initX: e.clientX,
      initY: e.clientY,
      initLeft: newX,
      initTop: newY,
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
    w.update({ max: !max });
  }

  function close() {
    w.close();
  }

  const icons = {
    min: windowMinimizeRegular,
    max: windowMaximizeRegular,
    restore: windowRestoreRegular,
    close: rectangleXmarkRegular,
  }

  const iconsSolid = {
    min: windowMinimizeSolid,
    max: windowMaximizeSolid,
    restore: windowRestoreSolid,
    close: rectangleXmarkSolid,
  }

  return (
    <>
      {true && <div
        className={`window${focused ? ' focused' : ''}${max ? ' fullscreen' : ''}`}
        style={{
          top: max ? 0 : y + 'px',
          left: max ? 0 : x + 'px',
          zIndex: z,
          width: !max && width,
          height: !max && height,
        }}
        onMouseDown={w.focus}
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
            <button className='window-btn' onClick={w_min}>
              {/*<img className='hover' src={iconsSolid.min} />*/}
              <img src={icons.min} />
            </button>
            <button className='window-btn' onClick={w_max}>
              {/*<img className='hover' src={max ? iconsSolid.restore : iconsSolid.max} />*/}
              <img src={max ? icons.restore : icons.max} />
            </button>
            <button className='window-btn window-close' onClick={close}>
              <img className='hover' src={iconsSolid.close} />
              <img src={icons.close} />
            </button>
          </div>
        </div>
        <div className='window-content'>
          {children}
        </div>
      </div>}
    </>
  )
}

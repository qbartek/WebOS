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
  const resizeRef = useRef(null);
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
      x: Math.min(window.innerWidth - 10, Math.max(-headerRef.current.offsetWidth + 120, drag.initLeft + e.clientX - drag.initX)),
      y: Math.min(window.innerHeight - headerRef.current.offsetHeight, Math.max(0, drag.initTop + e.clientY - drag.initY)),
    });
  }

  function startResizing(e, edge) {
    if (e.button != 0 || max || min) return;

    e.preventDefault();
    w.focus();

    resizeRef.current = {
      pointerId: e.pointerId,
      initX: e.clientX,
      initY: e.clientY,
      initLeft: x,
      initTop: y,
      edge,
      initWidth: width,
      initHeight: height,
    }

    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function stopResizing(e) {
    if (resizeRef.current?.pointerId !== e.pointerId) return;

    resizeRef.current = null;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function resize(e) {
    if (!resizeRef.current || resizeRef.current.pointerId !== e.pointerId) return;

    const dx = e.clientX - resizeRef.current.initX;
    const dy = e.clientY - resizeRef.current.initY;

    let newWidth = resizeRef.current.initWidth;
    let newHeight = resizeRef.current.initHeight;
    let newX = resizeRef.current.initLeft;
    let newY = resizeRef.current.initTop;

    if (resizeRef.current.edge.includes('e')) newWidth += dx;
    if (resizeRef.current.edge.includes('w')) newWidth -= dx;
    if (resizeRef.current.edge.includes('s')) newHeight += dy;
    if (resizeRef.current.edge.includes('n')) newHeight -= dy;

    if (newWidth < 200) newWidth = 200;
    if (newHeight < 100) newHeight = 100;
    
    if (resizeRef.current.edge.includes('w')) newX = resizeRef.current.initLeft + resizeRef.current.initWidth - newWidth;
    if (resizeRef.current.edge.includes('n')) newY = resizeRef.current.initTop + resizeRef.current.initHeight - newHeight;

    if (newX > window.innerWidth - 10) {
      newWidth += newX - window.innerWidth - 10;
      newX = window.innerWidth - 10;
    }

    if (newY > window.innerHeight - headerRef.current.offsetHeight) {
      newHeight += newY - window.innerHeight - headerRef.current.offsetHeight;
      newY = window.innerHeight - headerRef.current.offsetHeight;
    }

    if (newX + newWidth < 120) {
      newWidth = 120 - newX;
      newX = -newWidth + 120;
    }

    if (newY < 0) {
      newHeight -= 0 - newY;
      newY = 0;
    }

    w.update({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
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

  const taskbarElement = document.getElementById('bar-' + id);
  const taskbarRect = taskbarElement?.getBoundingClientRect();
  const minLocation = taskbarRect
    ? { x: taskbarRect.left + (taskbarElement.offsetWidth / 2), y: taskbarRect.top + taskbarElement.offsetHeight }
    : { x: 0, y: window.innerHeight };

  return (
    <>
      {<div
        className={`window${focused ? ' focused' : ''}${max ? ' fullscreen' : ''}${(!dragRef.current && !resizeRef.current) ? ' animated' : ''}`}
        style={{
          top: max ? 0 : y + 'px',
          left: max ? 0 : x + 'px',
          zIndex: z,
          width: !max && width,
          height: !max && height,
          transform: min ? (`translate(${minLocation.x - (width / 2) - x}px, ${minLocation.y - (height / 2) - y}px) scale(0)`) : undefined,
          opacity: min ? '0%' : undefined,
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
        {!max && !min && <>
          {['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map(edge => {
            return <div
              key={edge}
              className={`window-resize resize-${edge}`}
              onPointerDown={e => startResizing(e, edge)}
              onPointerMove={resize}
              onPointerUp={stopResizing}
              onPointerCancel={stopResizing}
            />
          })}
        </>}
      </div>}
    </>
  )
}

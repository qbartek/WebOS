import { useWindow } from "../system/WindowManager";

export default function Welcome({ window }) {
  useWindow(window, {
    title: 'Welcome',
    width: 430,
    height: 290,
    comp: <>
    
      <h1 style={{ textAlign: 'center' }}> Welcome! </h1>
      <p style={{ textAlign: 'center' }}>
        Welcome to my WebOS! <br />
        <button className="window-button" onClick={() => pm.start('explorer')}>Open file explorer</button>
        <button className="window-button" onClick={() => pm.start('notepad')}>Open text editor</button>
        <br />
        Click the <b>WebOS</b> in the bottom-left corner to quickly launch programs by typing their names.
        <br />
        <br />
        For more information, check out the README file.
      </p>
    </>
  });
}

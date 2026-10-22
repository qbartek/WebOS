import { useWindow } from "../system/WindowManager";

export default function Notepad({ window }) {
  useWindow(window, {
    icon: 'notepad.svg',
    title: 'Notepad',
    comp: <>
      <textarea style={{
        height: '100%',
        width: '100%',
        padding: '10px'
      }}></textarea>
    </>
  });
}

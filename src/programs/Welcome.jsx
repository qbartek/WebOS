import { useWindow } from "../system/WindowManager";

export default function Welcome({ window }) {
  useWindow(window, {
    title: 'Welcome',
    comp: <h1 style={{ textAlign: 'center' }}> Welcome </h1>
  });
}

import { useEffect } from "react";
import { DIALOG, showDialog } from "../../system/WindowManager";

export default function Run({ window, pid }) {
  useEffect(() => {
    if (pm.getPid('run').length > 1) return pm.kill(pid);

    const id = crypto.randomUUID();

    const runDialog = window.add({
      title: 'Run',
      comp: <>
        <form action={(formData) => {
          const program = formData.get('program');
          pm.start(program).then((error) => {
            if (typeof error === 'string') {
              showDialog(window, DIALOG.ERROR, "Error", error);
            }
            runDialog.close();
          });
        }}>
          <label style={{ marginLeft: '5px' }} htmlFor={id}>Open: </label>
          <input type='text' name='program' id={id} autoFocus></input>
          <button className='window-button' type='submit'>OK</button>
        </form>
        <p style={{ marginLeft: '5px' }}>
          Type the name of a program you want to start. <br />
          For example, you can type: <br />
          <code>notepad</code> - to open a text editor <br />
          <code>explorer</code> - to open the file explorer <br />
          <code>reset</code> - to reset the WebOS (remove all files) <br />
        </p>
      </>
    });

    return runDialog.close;
  }, []);
}

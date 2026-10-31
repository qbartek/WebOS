import { useEffect, useEffectEvent, useState } from "react";
import { useWindow } from "../system/WindowManager";

const SAVE_FILE = "/system/notepad.txt";
const SAVE_PATH = "/system/notepad.path.webos";

function NotepadWindow(props) {
  const [ready, setReady] = useState(false);
  const [path, setPath] = useState([SAVE_FILE, SAVE_PATH].includes(props.path) ? undefined : props.path);
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");

  const save = async () => {
    if (!ready) return;
    if (!path) {
      const savePath = '/desktop/';
      let i = 0;
      while (await fs.readFile(savePath + 'New file' + (i == 0 ? '' : ' (' + i + ')') + '.txt')) i++;
      const id = crypto.randomUUID();
      const window = props.wm.add({
        title: "Save file",
        comp: <>
          <form action={(formData) => {
            const fileName = formData.get('name');
            fs.writeFile(savePath + fileName + '.txt', content || '').catch((e) => {
              showDialog(window, DIALOG.ERROR, "Error", e.name);
              window.close();
            }).then(() => {
              setPath(savePath + fileName + '.txt');
              window.close();
            })
          }}>
            <h3>{"Create file in " + savePath + ':'}</h3>
            <label htmlFor={id}>Name: </label>
            <input type='text' name='name' id={id} defaultValue={'New file' + (i == 0 ? '' : ' (' + i + ')')} autoFocus></input>
            <button type='submit'>OK</button>
          </form>
        </>
      });
      return;
    }

    await fs.writeFile(path, content);
    setSavedContent(content);
  }

  const reset = async () => {
    if (!ready) return;
    setPath(undefined);
    await fs.remove(SAVE_PATH);
    await fs.remove(SAVE_FILE);
  }

  const handleKeyDown = useEffectEvent((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key == 's') save();
    if ((e.ctrlKey || e.metaKey) && e.key == 'n') reset();
  });

  useEffect(() => {
    let cancelled = false;

    setReady(false);

    async function readFile() {
      const lastPath = await fs.readFile(SAVE_PATH);
      const lastContent = await fs.readFile(SAVE_FILE);

      if (path && path == lastPath) {
        const savedContent = await fs.readFile(path);
        setSavedContent(savedContent);
        setContent(lastContent);
      } else if (path) {
        const savedContent = await fs.readFile(path);
        setSavedContent(savedContent);
        setContent(savedContent);
        await fs.writeFile(SAVE_PATH, path);
        await fs.writeFile(SAVE_FILE, savedContent);
      } else {
        if (lastPath) {
          const savedContent = await fs.readFile(lastPath);
          setSavedContent(savedContent);
          setContent(lastContent);
        } else {
          setSavedContent('');
          setContent(lastContent);
        }
        
        setPath(lastPath);
      }

      if (cancelled) return;
      setReady(true);
    }

    readFile();

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelled = true;
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [path]);

  return <>
    <div className='window-toolbar'>
      <button onClick={reset}>New</button>
      <button className={`${content === savedContent ? 'disabled' : ''}`} onClick={save}>Save</button>
      <div>{path || ''}</div>
    </div>
    {ready && <textarea className="notepad-ta" autoFocus value={content || ''} onChange={e => {
      setContent(e.target.value);
      fs.writeFile(SAVE_FILE, e.target.value);
      fs.writeFile(SAVE_PATH, path || '');
    }}></textarea>}
  </>
}

export default function Notepad({ window, args }) {
  useWindow(window, {
    //icon: 'notepad.svg',
    title: 'Notepad',
    comp: <NotepadWindow path={args[0]} wm={window} />
  });
}

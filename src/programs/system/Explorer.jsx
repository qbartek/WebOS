import { useEffect, useState, useSyncExternalStore } from "react";
import { getIcon } from "../../shared/files";

const EXPLORER_START = '/desktop/';

function ExplorerWindow({ startPath, wm }) {
  const [ready, setReady] = useState(false);
  const [path, setPath] = useState(startPath || EXPLORER_START);
  const [files, setFiles] = useState([]);
  const refresh = useSyncExternalStore(fs.subscribe, () => fs.version);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setReady(false);

    async function readDirectory() {
      const files = await fs.readDir(path);
      const filesToShow = files.filter(file => !['.webos'].includes(file.name));
      if (cancelled) return;
      setFiles(filesToShow);
      setReady(true);
    }

    readDirectory();

    return () => {
      cancelled = true;
    }
  }, [path, refresh]);

  useEffect(() => {
    const closeMenu = (e) => {
      if (e.target.closest('.context-menu')) return;
      setContextMenu(null);
    };
    document.addEventListener('pointerdown', closeMenu);

    return () => {
      document.removeEventListener('pointerdown', closeMenu);
    }
  }, []);

  const listContextMenuHandler = (e) => {
    if (e.target.tagName === "LI") return;
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      options: [
        {
          text: "Create folder",
          action: async (e) => {
            let i = 0;
            while (await fs.readDir(path + 'New folder' + (i == 0 ? '' : ' (' + i + ')') + '/')) i++;
            const id = crypto.randomUUID();
            const window = wm.add({
              title: "Create",
              comp: <>
                <form action={(formData) => {
                  const folderName = formData.get('name');
                  fs.createDir(path + folderName).catch((e) => {
                    showDialog(window, DIALOG.ERROR, "Error", e.name);
                    window.close();
                  }).then(() => {
                    window.close();
                  })
                }}>
                  <h3>{"Create folder in " + path + ':'}</h3>
                  <label htmlFor={id}>Name: </label>
                  <input type='text' name='name' id={id} defaultValue={'New folder' + (i == 0 ? '' : ' (' + i + ')') + '/'} autoFocus></input>
                  <button type='submit'>OK</button>
                </form>
              </>
            });
          },
        },
      ]
    });
  }

  const getFileContextMenuHandler = (file) => {
    const isDirectory = file.endsWith('/');
    return (e) => {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        options: [
          {
            text: isDirectory ? "Delete folder" : "Delete file",
            action: () => {
              fs.remove(file);
            },
          },
        ]
      });
    }
  }

  const parentDir = path.slice(0, -1).split('/').slice(0, -1).join('/') + '/';

  return <div className='explorer-container'>
    <input className='explorer-path' onChange={(e) => setPath(e.target.value)} value={path} />
    {ready && <ul className='explorer-list' onContextMenu={listContextMenuHandler}>
      {path !== '/' && <li className='explorer-back' onClick={() => setPath(parentDir)}><img src={getIcon('..')} />{parentDir}</li>}
      {files.map(file => {
        const isDirectory = file.kind === 'directory';
        const displayName = file.name.split('.').slice(0, -1).join('.') || file.name;
        const extension = (file.name.includes('.') ? '.' : '') + file.name.split('.').at(-1);

        const icon = isDirectory ? getIcon('explorer') : getIcon(extension);

        return <li
          onClick={() => (file.kind === 'directory' ? setPath(path + file.name + '/') : pm.start(path + file.name))}
          onContextMenu={getFileContextMenuHandler(path + file.name + (isDirectory ? '/' : ''))}
        >
          <img src={icon} />
          {displayName}
        </li>
      })}
    </ul>}

    {contextMenu && <div
      className="context-menu"
      style={{
        left: contextMenu.x,
        top: contextMenu.y,
        zIndex: 1000,
      }}
    >
      {contextMenu.options.map(option => {
        return <button onClick={(e) => {
          setContextMenu(null);
          option.action(e);
        }}>{option.text}</button>
      })}
    </div>}
  </div>
}

export default function Explorer({ window, pid, args }) {
  useEffect(() => {
    const explorerWindow = window.add({
      title: 'File explorer',
      comp: <ExplorerWindow startPath={args[0]} wm={window} />,
    });

    return explorerWindow.close;
  }, []);
}

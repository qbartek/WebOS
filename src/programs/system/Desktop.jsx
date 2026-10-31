import { useEffect, useState, useSyncExternalStore } from "react";
import { getIcon } from "../../shared/files";

function DesktopIcon({ icon: { name, path, icon, open }, onContextMenu }) {
  return <button className='desktop-icon' onClick={open} onContextMenu={onContextMenu}>
    <img src={icon}></img>
    <label>{name}</label>
  </button>
}

const DESKTOP_PATH = '/desktop/';

export default function Desktop({ window: wm }) {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const refresh = useSyncExternalStore(fs.subscribe, () => fs.version);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFiles() {
      const desktopFiles = await fs.readDir(DESKTOP_PATH, { create: true });

      const desktopIcons = await Promise.all(desktopFiles.map(async ({ name, kind }) => {
        const isDirectory = kind === 'directory';
        const path = DESKTOP_PATH + name + (isDirectory ? '/' : '');
        const displayName = name.split('.').slice(0, -1).join('.') || name;
        const extension = (name.includes('.') ? '.' : '') + name.split('.').at(-1);
        const isSystemFile = !isDirectory && name.endsWith('.webos');

        let icon;
        if (!isDirectory && isSystemFile) {
          const content = await fs.readFile(path);
          if (content && content.startsWith('#!')) {
            icon = getIcon(content.slice(2));
          } else {
            icon = getIcon(extension);
          }
        } else if (isDirectory) {
          icon = getIcon('explorer');
        } else {
          icon = getIcon(extension);
        }

        return {
          name: displayName,
          path,
          icon,
          open: () => pm.start(path),
        }
      }));

      if (!cancelled) {
        setFiles(desktopIcons);
        setLoading(false);
      }
    }

    loadFiles();

    return () => {
      cancelled = true;
    }
  }, [refresh]);

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
    if (e.target.closest('.desktop-icon')) return;
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      options: [
        {
          text: "Create folder",
          action: async (e) => {
            let i = 0;
            while (await fs.readDir(DESKTOP_PATH + 'New folder' + (i == 0 ? '' : ' (' + i + ')') + '/')) i++;
            const id = crypto.randomUUID();
            const window = wm.add({
              title: "Create",
              comp: <>
                <form action={(formData) => {
                  const folderName = formData.get('name');
                  fs.createDir(DESKTOP_PATH + folderName).catch((e) => {
                    console.log(e);
                    showDialog(window, DIALOG.ERROR, "Error", e.name);
                    window.close();
                  }).then(() => {
                    window.close();
                  })
                }}>
                  <h3>{"Create folder in " + DESKTOP_PATH + ':'}</h3>
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

  return loading || (
    <>
      <div className='desktop' onContextMenu={listContextMenuHandler}>
        {files.map((icon) => <DesktopIcon icon={icon} key={icon.path} onContextMenu={getFileContextMenuHandler(icon.path)} />)}
      </div>
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
    </>
  )
}

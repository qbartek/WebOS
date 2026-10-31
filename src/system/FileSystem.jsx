import { useRef } from "react";
import { log, warn } from "../shared/log.js";

async function requestPersistent() {
  if (navigator.storage && navigator.storage.persist) {
    const persistent = await navigator.storage.persist()
    if (persistent) {
      log("Persistent storage request granted, bucket mode is persistent.");
    } else {
      warn("Warning: Storage may be cleared by the UA under storage pressure.");
    }
  }
}

function getByteSizeString(bytes) {
  if (!bytes) return '-';
  return `${(bytes / 1024).toFixed(2)} KB (${bytes} bytes)`
}

async function checkStorageUsageAndQuota() {
  const estimate = await navigator.storage.estimate?.();
  const persisted = await navigator.storage.persisted?.();

  const keyLength = Math.max(...Object.entries(estimate.usageDetails).map(([key]) => key.length), "Total".length);
  log(`Storage${[persisted ? ' persistent' : '']}:\n` +
    ` ${`Total:`.padEnd(keyLength + 1)} ${getByteSizeString(estimate.usage)} of` +
    ` ${(estimate.quota / 1024 / 1024).toFixed(2)} MB (${((estimate.usage / estimate.quota) * 100).toFixed(2)}%)\n` +
    Object.entries(estimate.usageDetails).map(([key, value]) => ` ${`${key}:`.padEnd(keyLength + 1)} ${getByteSizeString(value)}`));
}

async function printDir(fs, path = '/') {
  let out = "";
  for (const { name, kind } of await fs.readDir(path)) {
    out += `${kind === 'directory' ? "<DIR>" : "     "} ${name}\n`;
  }
  return out;
}

class FileSystem {
  constructor() {
    this.listeners = new Set();
    this.version = 0;
  }

  async _getFSRoot(path = '/') {
    if (path.startsWith('/')) {
      const OPFSRoot = await navigator.storage.getDirectory();
      const FSRoot = await OPFSRoot.getDirectoryHandle('webos', { create: true });
      return { root: FSRoot, path: path.slice(1) }
    }
    return { root: null, path: null }
  }

  async _getDirHandle(path, options = {}) {
    let { root: dir, path: newPath } = await this._getFSRoot(path);
    path = newPath;
    const segments = path ? path.split('/').filter(Boolean) : [];
    for (const name of segments) dir = await dir.getDirectoryHandle(name, options);
    return dir;
  }

  async _getHandle(path, options = {}) {
    const pathSplit = path.split('/');
    const dir = pathSplit.slice(0, -1).join('/') + '/';
    const dirHandle = await this._getDirHandle(dir, options);
    const name = pathSplit[pathSplit.length - 1];

    return await dirHandle.getFileHandle(name, options);
  }

  subscribe = (callback) => {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  _notify() {
    this.version++;
    this.listeners.forEach(callback => callback());
  }

  async createDir(path) {
    log("Create:", path);
    await this._getDirHandle(path, { create: true });
    this._notify();
  }

  async readDir(path, options) {
    log("Read:", path);
    try {
      const handle = await this._getDirHandle(path, options);
      const out = [];
      for await (const [name, h] of handle.entries()) {
        out.push({ name, kind: h.kind });
      }
      return out;
    } catch (e) {
      log(e)
      if (e.name == 'NotFoundError') {
        return null;
      } else {
        throw e;
      }
    }
  }

  async writeFile(path, content) {
    log("Write:", path);
    const handle = await this._getHandle(path, { create: true });
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    this._notify();
  }

  async readFile(path) {
    log("Read:", path);
    try {
      const handle = await this._getHandle(path);
      const file = await handle.getFile();
      return await file.text();
    } catch (e) {
      log(e)
      if (e.name == 'NotFoundError') {
        return null;
      } else {
        throw e;
      }
    }
  }

  async remove(path, options = {}) {
    log("Remove:", path);
    if (path.endsWith('/')) {
      path = path.split('').slice(0, -1).join('');
      options = { ...options, recursive: true };
    }
    const name = path.split('/').slice(-1);
    const parent = await this._getDirHandle(path.split('/').slice(0, -1).join('/') || '/');
    await parent.removeEntry(name, options);
    this._notify();
  }

  async clear() {
    await (await this._getFSRoot()).root.remove({ recursive: true });
    this._notify();
  }
}

export class FSError extends Error {
  constructor(code, message) {

  }
}

const fsInit = async (fs) => {
  await requestPersistent();
  await checkStorageUsageAndQuota();

  const flags = await fs.readFile("/.webos");

  if (!flags) {
    const initFlags = 1;
    await fs.writeFile("/.webos", initFlags);
    await fs.createDir("/desktop/");
    await fs.writeFile("/desktop/Notepad.webos", "#!notepad");
    await fs.writeFile("/desktop/Welcome to WebOS!.webos", "#!welcome");
    await fs.writeFile("/desktop/README.txt", `WebOS

To create or delete files and folders, right-click anywhere in the file explorer or on the desktop to open the context menu.

------------------

Keyboard shortcuts
Note: Some shortcuts may only work in fullscreen mode or not work at all depending on the browser.
Press F11 to enter fullscreen mode.

System:
 Ctrl + R - Open the Run dialog
 Ctrl + E - Open the file explorer
 F5 - Restart WebOS (refresh the page)
 Note: Restarting does not delete your files. To reset the filesystem, open the Run dialog (Ctrl+R) and type 'reset'.

When using the text editor:
 Ctrl + S - Save the current file
 Ctrl + N - Create a new file
      `)
    await fs.createDir("/system/");
    await fs.writeFile("/system/init-time.webos", (new Date()).toISOString());
    await fs.writeFile("/system/autostart.webos", ["welcome"].join('\n'));
    await fs.writeFile("/system/Run.webos", "#!run");
  }
}

export function useFileSystem(setReady) {
  const fileSystemRef = useRef();

  if (!fileSystemRef.current) {
    const fileSystem = new FileSystem();
    fileSystemRef.current = fileSystem;
    fsInit(fileSystem).then(async () => {
      setReady(true);

      (await fs.readFile('/system/autostart.webos')).split('\n').forEach(line => {
        pm.start(line);
      });
    })
  }

  return fileSystemRef.current;
}

import folderOpen from '/src/assets/icons/folder-open-regular-full.svg';
import caretUp from '/src/assets/icons/caret-up-solid-full.svg';
import fileLines from '/src/assets/icons/file-lines-regular-full.svg';
import file from '/src/assets/icons/file-regular-full.svg';

export function getIcon(icon) {
  switch (icon) {
    case 'explorer':
      return folderOpen;
    case '..':
      return caretUp;
    case 'notepad':
    case '.txt':
      return fileLines;
    default:
      return file;
  }
}

const extMap = {
  '/': 'explorer',
  '.webos': 'notepad',
  '.txt': 'notepad',
}

export function getProgramFromExtension(file) {
  const ext = Object.keys(extMap).find(ext => file.endsWith(ext));
  return extMap[ext] ?? 'notepad';
}

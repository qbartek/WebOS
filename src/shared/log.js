export function log(...data) {
  console.debug(...data);
}

export function warn(...data) {
  console.warn(...data);
}

export function alert(message) {
    setTimeout(() => window.alert(message), 1);
}

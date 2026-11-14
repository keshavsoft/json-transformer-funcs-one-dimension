export function initMonaco() {
  return new Promise((resolve, reject) => {
    if (window.monaco?.editor) return resolve(window.monaco);
    if (!window.require) return reject(new Error('Monaco AMD loader is missing.'));
    window.require.config({
      paths: {
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs'
      }
    });
    window.require(['vs/editor/editor.main'], () => {
      if (window.monaco?.editor) resolve(window.monaco);
      else reject(new Error('Monaco API unavailable.'));
    }, reject);
  });
}

export default initMonaco;

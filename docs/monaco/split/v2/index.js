import { initMonaco } from './editors/common/js/monacoLoader.js';
import { initLeftEditor } from './editors/left/js/index.js';
import { initRightEditor } from './editors/right/js/index.js';

async function boot() {
  try {
    const monaco = await initMonaco();

    const leftEditor = initLeftEditor(monaco, 'paneLeft');
    const rightEditor = initRightEditor(monaco, 'paneRight');

    console.info('[Monaco Split V3] Both left and right editors booted with local JSON file selectors.');
  } catch (error) {
    console.error('[Monaco Split V3 Error]', error);
  }
}

boot();

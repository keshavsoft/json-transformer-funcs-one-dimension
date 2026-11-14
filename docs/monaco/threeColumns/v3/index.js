import { initMonaco } from './editors/common/js/monacoLoader.js';
import { initLeftEditor } from './editors/left/js/index.js';
import { initMiddleEditor } from './editors/middle/js/index.js';
import { initRightEditor } from './editors/right/js/index.js';

async function boot() {
  try {
    const monaco = await initMonaco();

    const leftEditor = initLeftEditor(monaco, 'paneLeft');
    const middleEditor = initMiddleEditor(monaco, 'paneMiddle');
    const rightEditor = initRightEditor(monaco, 'paneRight');

    console.info('[Monaco Three Columns V1] All three editors initialized cleanly.');
  } catch (error) {
    console.error('[Monaco Three Columns V1 Error]', error);
  }
}

boot();

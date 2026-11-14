import { initMonaco } from './editors/common/js/monacoLoader.js';
import { initLeftEditor } from './editors/left/js/index.js';
import { initMiddleEditor } from './editors/middle/js/index.js';
import { initRightEditor } from './editors/right/js/index.js';

async function boot() {
  try {
    const monaco = await initMonaco();

    const leftEditor = initLeftEditor(monaco, 'paneLeft');
    const middleEditor = initMiddleEditor(monaco, 'paneMiddle');
    const rightEditor = initRightEditor(monaco, 'paneRight', { leftEditor, middleEditor });

    console.info('[Monaco Three Columns V3] Editors initialized with Transform action hook.');
  } catch (error) {
    console.error('[Monaco Three Columns V3 Error]', error);
  }
}

boot();

import config from './config.json' with { type: 'json' };
import columns from './columns.json' with { type: 'json' };

let editorInstance = null;

export const actions = {
  create: (monaco = window.monaco) => {
    const container = document.getElementById(config.containerId);
    if (!container) throw new Error(`Container #${config.containerId} not found.`);

    const initialData = columns ?? config.initialValue;
    const initialText = typeof initialData === 'string'
      ? initialData
      : JSON.stringify(initialData, null, 2);

    const model = monaco.editor.createModel(
      initialText,
      config.language || 'json',
      monaco.Uri.parse(config.modelUri)
    );

    editorInstance = monaco.editor.create(container, {
      ...config,
      model
    });

    return editorInstance;
  },

  loadFile: async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      if (editorInstance) {
        editorInstance.setValue(text);
        const footer = document.getElementById('footerInfoLeft');
        if (footer) footer.textContent = `File: ${file.name} (${file.size} bytes)`;
      }
    } catch (err) {
      console.error('[Left Editor] File load failed:', err);
    }
  }
};

export default actions;

import config from './config.json' with { type: 'json' };

let editorInstance = null;

export const actions = {
  create: (monaco = window.monaco) => {
    const container = document.getElementById(config.containerId);
    if (!container) throw new Error(`Container #${config.containerId} not found.`);

    const initialText = typeof config.initialValue === 'string'
      ? config.initialValue
      : JSON.stringify(config.initialValue, null, 2);

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
        const footer = document.getElementById('footerInfoRight');
        if (footer) footer.textContent = `File: ${file.name} (${file.size} bytes)`;
      }
    } catch (err) {
      console.error('[Right Editor] File load failed:', err);
    }
  }
};

export default actions;

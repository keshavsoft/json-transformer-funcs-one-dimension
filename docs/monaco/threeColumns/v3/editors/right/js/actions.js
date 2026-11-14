import config from './config.json' with { type: 'json' };

let editorInstance = null;
let context = {};

export const actions = {
  setContext: (ctx) => {
    context = ctx;
  },

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

  transform: () => {
    // Write your transformation code here
    window.ks.transformer.funcs.oneDimension.transform();
    console.info('[Transform Action] Hooked successfully. Write your transformation logic here.');
  }
};

export default actions;

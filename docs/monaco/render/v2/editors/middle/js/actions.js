import config from './config.json' with { type: 'json' };
import { spec } from 'https://keshavsoft.github.io/spec-repo/dist/v6/min.js';

let editorInstance = null;

export const actions = {
  create: (monaco = window.monaco) => {
    const container = document.getElementById(config.containerId);
    if (!container) throw new Error(`Container #${config.containerId} not found.`);

    const select = document.getElementById('templateSelect');
    if (select && spec) {
      select.innerHTML = '<option value="">-- Select Template --</option>';
      for (const key of Object.keys(spec)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        select.appendChild(option);
      }
    }

    const defaultKey = 'buildColGroup';
    const initialData = (spec && spec[defaultKey]) ? spec[defaultKey] : config.initialValue;
    if (select && spec && spec[defaultKey]) {
      select.value = defaultKey;
    }

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

    const footer = document.getElementById('footerInfoMiddle');
    if (footer) footer.textContent = `Template: ${defaultKey}`;

    return editorInstance;
  },

  onTemplateChange: (event) => {
    const key = event.target.value;
    if (!key || !spec || !spec[key]) return;

    if (editorInstance) {
      editorInstance.setValue(JSON.stringify(spec[key], null, 2));
      const footer = document.getElementById('footerInfoMiddle');
      if (footer) footer.textContent = `Template: ${key}`;
    }
  }
};

export default actions;

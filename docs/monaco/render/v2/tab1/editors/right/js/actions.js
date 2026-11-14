import config from './config.json' with { type: 'json' };

const CHANNEL_NAME = 'keshavsoft-render-1d';
const STORAGE_KEY_CONTENT = 'keshavsoft_render_1d_content';

let editorInstance = null;
let context = {};
let renderWindow = null;

const channel = new BroadcastChannel(CHANNEL_NAME);

function updateTab2Badge(text, isLive = true) {
  const badge = document.getElementById('tab2SyncStatus');
  const textEl = document.getElementById('tab2SyncText');
  if (!badge) return;

  if (textEl) textEl.textContent = text;
  badge.classList.remove('hidden');

  if (isLive) {
    badge.style.background = 'rgba(6, 78, 59, 0.8)';
    badge.style.borderColor = '#065f46';
    badge.style.color = '#34d399';
  } else {
    badge.style.background = 'rgba(120, 53, 15, 0.8)';
    badge.style.borderColor = '#92400e';
    badge.style.color = '#fbbf24';
  }
}

// Channel listener for Tab 2 handshake and acknowledgments
channel.onmessage = (event) => {
  const msg = event.data || {};
  if (msg.type === 'TAB_READY') {
    updateTab2Badge('Tab 2 Connected ✓', true);
    // Optionally beam latest content if editor has content
    try {
      const content = editorInstance ? editorInstance.getValue() : '';
      if (content) {
        const parsed = JSON.parse(content);
        channel.postMessage({
          type: 'RENDER_SPEC',
          spec: parsed,
          content
        });
      }
    } catch (_) {}
  } else if (msg.type === 'RENDER_ACK') {
    updateTab2Badge(`Tab 2 Live (${msg.count} elements) ✓`, true);
  } else if (msg.type === 'RENDER_ERROR') {
    updateTab2Badge(`Tab 2 Error: ${msg.message}`, false);
  }
};

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
    const columns = context.leftEditor.getValue();
    const template = context.middleEditor.getValue();
    const columnsAsJson = JSON.parse(columns);
    const templateAsJson = JSON.parse(template);

    console.log("columnsAsJson : ", columnsAsJson);
    const generatedSpec = window.ks.transformer.funcs.oneDimension.template(columnsAsJson, templateAsJson);
    editorInstance.setValue(JSON.stringify(generatedSpec, null, 2));
  },

  renderInTab2: () => {
    let content = editorInstance ? editorInstance.getValue().trim() : '';

    // If editor has initial placeholder, automatically run transform first
    if (!content || content.includes('"Target Output"')) {
      actions.transform();
      content = editorInstance.getValue().trim();
    }

    if (!content) {
      console.warn('[Render] Output editor is empty.');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('[Render Error] Invalid JSON in output editor:', e);
      return;
    }

    // 1. Ensure Tab 2 is open or focused
    if (!renderWindow || renderWindow.closed) {
      const url = new URL('../../tab2/', location.href);
      renderWindow = window.open(url.href, 'keshavsoft_render_1d_tab2');
    } else {
      renderWindow.focus();
    }

    // 2. Cache in localStorage for automatic rehydration
    try {
      localStorage.setItem(STORAGE_KEY_CONTENT, content);
    } catch (e) {
      console.warn('[Storage Error]', e);
    }

    // 3. Beam payload via BroadcastChannel
    channel.postMessage({
      type: 'RENDER_SPEC',
      spec: parsed,
      content
    });

    console.info('[Render in Tab 2] Beamed spec to Tab 2.');
  }
};

export default actions;

import bindings from './bindings.json' with { type: 'json' };
import actions from './actions.js';

export function initMiddleEditor(monaco, containerOrId = 'paneMiddle') {
  const editor = actions.create(monaco);

  const bindEvents = window.ks?.domPrimitive?.bindings?.bindEvents || window.ks?.bindEvents;
  if (typeof bindEvents === 'function') {
    bindEvents(containerOrId, bindings, actions);
  }

  return editor;
}

export default initMiddleEditor;

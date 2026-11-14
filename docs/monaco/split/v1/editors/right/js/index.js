import bindings from './bindings.json' with { type: 'json' };
import actions from './actions.js';

export function initRightEditor(monaco, containerOrId = 'paneRight') {
  const editor = actions.create(monaco);

  const bindEvents = window.ks?.domPrimitive?.bindings?.bindEvents || window.ks?.bindEvents;
  if (typeof bindEvents === 'function') {
    bindEvents(containerOrId, bindings, actions);
  }

  return editor;
}

export default initRightEditor;

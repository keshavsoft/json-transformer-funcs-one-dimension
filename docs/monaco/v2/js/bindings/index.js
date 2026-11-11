import bindings from "../../bindings.json" with { type: "json" };
import actions from "./actions.js";

export const initBindings = (container = document.body) => {
    window.ks.bindEvents(container, bindings, actions);
};

export default initBindings;

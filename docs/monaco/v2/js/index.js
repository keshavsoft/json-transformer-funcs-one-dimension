import initMonaco from "./monacoEditor/index.js";
import initBindings from "./bindings/index.js";

const startFunc = async () => {
    await initMonaco();
    initBindings();
};

startFunc();

import { models, activateTab, editor } from "../monacoEditor/index.js";
import loopWithIndividualTemplate from "https://keshavsoft.github.io/json-transformer-funcs-one-dimension/dist/v9/min.js";

function setEditorContent(content, filename = "file.json") {
    if (!editor || !window.monaco) return;

    const language = filename.endsWith(".js") ? "javascript" : "json";
    const model = window.monaco.editor.createModel(content, language);
    editor.setModel(model);
};

function renderAstToDom(node) {
    if (!node) return null;
    if (typeof node === "string") return document.createTextNode(node);
    if (typeof node === "number") return document.createTextNode(String(node));

    const el = document.createElement(node.tagName || "div");
    if (node.attributes) {
        for (const [k, v] of Object.entries(node.attributes)) {
            if (v !== undefined) el.setAttribute(k, v);
        }
    }
    if (node.textContent !== undefined) {
        el.textContent = node.textContent;
    }
    if (Array.isArray(node.children)) {
        for (const child of node.children) {
            const childDom = renderAstToDom(child);
            if (childDom) el.appendChild(childDom);
        }
    }
    return el;
}

function updateTargetDropdown() {
    const stage = document.getElementById("renderOutput");
    const targetSelect = document.getElementById("targetSelect");
    if (!stage || !targetSelect) return;

    const currentVal = targetSelect.value;
    const foundIds = new Set(["renderOutput"]);

    targetSelect.innerHTML = `<option value="renderOutput">#renderOutput (Root Stage)</option>`;

    // Only scan within the right-side renderOutput stage, not the whole DOM
    const idNodes = stage.querySelectorAll("[id]");
    idNodes.forEach((node) => {
        const id = node.id;
        if (id && !foundIds.has(id)) {
            foundIds.add(id);
            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = `#${id} (${node.tagName.toLowerCase()})`;
            targetSelect.appendChild(opt);
        }
    });

    // Retain previous target selection if still present
    if (foundIds.has(currentVal) && currentVal !== "renderOutput") {
        targetSelect.value = currentVal;
    } else {
        // Automatically select the inner target container inside base (e.g. countrySelect, tableHeaderRow, countryList)
        const preferredChild = Array.from(foundIds).find(id => id !== "renderOutput" && id !== "baseTable")
            || "renderOutput";
        targetSelect.value = preferredChild;
    }
};

export const actions = {
    openSystemFilePicker: () => {
        const fileInput = document.getElementById("fileInput");
        if (fileInput) {
            fileInput.value = "";
            fileInput.click();
        }
    },

    // 📄 2. Handle file selection from local system
    handleFileSelection: (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result;
            if (typeof content === "string") {
                models.base.setValue(content);
                activateTab("tabBase", models.base);

                try {
                    const parsed = JSON.parse(content);
                    const stage = document.getElementById("renderOutput");
                    if (stage) {
                        stage.innerHTML = "";
                        const domEl = renderAstToDom(parsed);
                        if (domEl) stage.appendChild(domEl);
                    }
                    try {
                        window.ks?.jsonToDom?.appendToDom({
                            jsonSpec: parsed,
                            targetHtmlId: "renderOutput",
                            appendPosition: "replace",
                            showLog: false
                        });
                    } catch (err) {}
                    updateTargetDropdown();
                } catch (err) {
                    console.error("Invalid base JSON:", err);
                }
            }
        };
        reader.readAsText(file);
    },

    // ⚡ 3. Center Render Button: Mount 1D Collection or Container into Target ID & Harvest IDs
    render: () => {
        const stage = document.getElementById("renderOutput");
        if (!stage || !editor) return;

        try {
            const raw = editor.getValue();
            const parsed = JSON.parse(raw);
            // console.log("parsed : ", parsed);

            // If base.json tab is currently active, render it to #renderOutput (Root Stage)
            const isBaseTab = document.getElementById("tabBase")?.classList.contains("active");
            const targetSelect = document.getElementById("targetSelect");
            const targetHtmlId = isBaseTab ? "renderOutput" : (targetSelect?.value || "renderOutput");
            const appendPos = (isBaseTab || targetHtmlId === "renderOutput") ? "replace" : "append";

            try {
                window.ks?.jsonToDom?.appendToDom({
                    jsonSpec: parsed, targetHtmlId,
                    appendPosition: appendPos, showLog: false
                });
            } catch (err) {
                console.warn("jsonToDom render error:", err);
            }

            const targetEl = document.getElementById(targetHtmlId);
            if (targetEl && Array.isArray(parsed) && targetHtmlId !== "renderOutput") {
                parsed.forEach(item => {
                    const optVal = item.attributes?.value ?? "";
                    const optText = item.textContent ?? "";
                    const alreadyExists = Array.from(targetEl.children).some(child => 
                        (child.value === optVal && child.textContent === optText)
                    );
                    if (!alreadyExists) {
                        const el = renderAstToDom(item);
                        if (el) targetEl.appendChild(el);
                    }
                });
            }

            // 🎯 Harvest all IDs inside the right render tab and populate the dropdown
            updateTargetDropdown();

        } catch (err) {
            console.error("Render error:", err);
            stage.innerHTML = `
                <div class="alert alert-danger font-monospace small" role="alert">
                    <strong><i class="bi bi-exclamation-triangle me-1"></i>Render Error:</strong>
                    <div class="mt-1">${err.message}</div>
                </div>`;
        }
    },

    loadBase: async () => {
        const response = await fetch("./base.json");
        const json = await response.json();

        models.base.setValue(JSON.stringify(json, null, 2));
        activateTab("tabBase", models.base);

        window.ks.jsonToDom.appendToDom({
            jsonSpec: json,
            targetHtmlId: "renderOutput",
            appendPosition: "replace",
            showLog: false
        });

        updateTargetDropdown();
    },

    loadRaka: async () => {
        const response = await fetch("./columns.json");
        const json = await response.json();

        models.columns.setValue(JSON.stringify(json, null, 2));
        activateTab("tabColumns", models.columns);
    },

    loadTemplate: async () => {
        const response = await fetch("./template.json");
        const json = await response.json();

        models.template.setValue(JSON.stringify(json, null, 2));
        activateTab("tabTemplate", models.template);
    },

    build: async () => {
        // Ensure columns and template models have content
        let colVal = models.columns.getValue().trim();
        if (!colVal || colVal === "[]") {
            const res = await fetch("./columns.json");
            const json = await res.json();
            models.columns.setValue(JSON.stringify(json, null, 2));
            colVal = models.columns.getValue();
        }

        let tmplVal = models.template.getValue().trim();
        if (!tmplVal || tmplVal === "{}") {
            const res = await fetch("./template.json");
            const json = await res.json();
            models.template.setValue(JSON.stringify(json, null, 2));
            tmplVal = models.template.getValue();
        }

        const columns = JSON.parse(colVal);
        const template = JSON.parse(tmplVal);

        const spec = loopWithIndividualTemplate(columns, template);
        console.log("Transformed 1D Spec:", spec);

        models.output.setValue(JSON.stringify(spec, null, 2));
        activateTab("tabOutput", models.output);

        // 1. Ensure the base container is rendered into the stage
        const baseVal = models.base.getValue().trim();
        if (baseVal) {
            try {
                const baseJson = JSON.parse(baseVal);
                window.ks.jsonToDom.appendToDom({
                    jsonSpec: baseJson,
                    targetHtmlId: "renderOutput",
                    appendPosition: "replace",
                    showLog: false
                });
                updateTargetDropdown();
            } catch (e) {
                console.error("Base JSON render error:", e);
            }
        }

        // 2. Mount rendered 1D collection into the selected target container
        const targetSelect = document.getElementById("targetSelect");
        const targetHtmlId = targetSelect?.value || "renderOutput";
        const appendPos = targetHtmlId === "renderOutput" ? "replace" : "append";

        try {
            window.ks?.jsonToDom?.appendToDom({
                jsonSpec: spec,
                targetHtmlId: targetHtmlId,
                appendPosition: appendPos,
                showLog: false
            });
        } catch (err) {
            console.warn("jsonToDom append error:", err);
        }

        // Guarantee elements are appended to container
        const targetEl = document.getElementById(targetHtmlId);
        if (targetEl && Array.isArray(spec)) {
            spec.forEach(item => {
                const optVal = item.attributes?.value ?? "";
                const optText = item.textContent ?? "";
                const alreadyExists = Array.from(targetEl.children).some(child => 
                    (child.value === optVal && child.textContent === optText)
                );
                if (!alreadyExists) {
                    const el = renderAstToDom(item);
                    if (el) targetEl.appendChild(el);
                }
            });
        }

        // 🎯 Harvest all IDs inside the right render tab and populate the dropdown
        updateTargetDropdown();
    },

    showTabBase: () => {
        activateTab("tabBase", models.base);
    },

    showTabColumns: () => {
        activateTab("tabColumns", models.columns);
    },

    showTabTemplate: () => {
        activateTab("tabTemplate", models.template);
    },

    showTabOutput: () => {
        activateTab("tabOutput", models.output);
    }
};

export default actions;

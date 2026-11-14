import commonTemplate from "../../../src/index.js";
import { spec } from "spec-repo";

import columns from "./columns.json" with { type: "json" };

const generatedSpec = commonTemplate(columns, spec.buildSelect);

console.log("generatedSpec : ", generatedSpec);
// console.log("spec : ", spec);
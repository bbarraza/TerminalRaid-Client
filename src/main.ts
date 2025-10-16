// src/main.ts
import { createCLI } from "./cli";

const container = document.getElementById("terminal");
if (!container) throw new Error("Cannot find container element");

createCLI(container);

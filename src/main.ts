// src/main.ts
import "xterm/css/xterm.css";
import { createCLI } from "./cli";

const container = document.getElementById("terminal");
if (!container) throw new Error("Cannot find container element");

createCLI(container);

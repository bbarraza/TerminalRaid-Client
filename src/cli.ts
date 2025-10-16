// src/cli.ts
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import * as api from "./api";

export function createCLI() {
  const term = new Terminal({
    cols: 120,
    rows: 35,
    cursorBlink: true,
    theme: {
      background: "#000000", // full black
      foreground: "#c5c8c6", // light grey text
      cursor: "#00ff00",     // green cursor
    },
    scrollback: 1000,
  });



  const container = document.getElementById("terminal");
  if (!container) throw new Error("Terminal container not found");
  term.open(container);

  let inputBuffer = "";
  let currentPlayerId: string | null = null;

  term.write("\x1b[32mWelcome to TerminalRaid!\x1b[0m\r\n");
  term.write("\x1b[36mType 'help' for commands.\x1b[0m\r\n\r\n> ");

  term.onKey(async ({ key, domEvent }) => {
    const code = domEvent.code;

    if (code === "Enter") {
      const input = inputBuffer.trim();
      term.write("\r\n");
      await handleCommand(input, term);
      inputBuffer = "";
      term.write("> ");
    } else if (code === "Backspace") {
      if (inputBuffer.length > 0) {
        inputBuffer = inputBuffer.slice(0, -1);
        term.write("\b \b");
      }
    } else if (!domEvent.ctrlKey && !domEvent.metaKey) {
      inputBuffer += key;
      term.write(key);
    }
  });

  async function handleCommand(input: string, term: Terminal) {
    if (!input) return;
    const args = input.split(" ");
    const cmd = args[0].toLowerCase();

    try {
      switch (cmd) {
        case "login": {
          const username = args[1];
          const password = args[2];
          if (!username || !password) {
            term.write("Usage: login <username> <password>\r\n");
            break;
          }
          const loginResp = await api.login(username, password);
          currentPlayerId = loginResp.playerId;
          term.write("Logged in successfully!\r\n");
          break;
        }

        case "register": {
          const username = args[1];
          const password = args[2];
          if (!username || !password) {
            term.write("Usage: register <username> <password>\r\n");
            break;
          }
          await api.register(username, password);
          term.write("Registered successfully!\r\n");
          break;
        }

        case "logout":
          if (currentPlayerId) {
            await api.logout(currentPlayerId);
            currentPlayerId = null;
            api.clearAuthToken();
            term.write("Logged out!\r\n");
          } else {
            term.write("Not logged in!\r\n");
          }
          break;

        case "start":
          await api.startMining();
          term.write("Mining started!\r\n");
          break;

        case "stop":
          await api.stopMining();
          term.write("Mining stopped!\r\n");
          break;

        case "claim":
          await api.claimMining();
          term.write("Mining rewards claimed!\r\n");
          break;

        case "status": {
          const status = await api.miningStatus();
          term.write(JSON.stringify(status, null, 2) + "\r\n");
          break;
        }

        case "history": {
          const limit = parseInt(args[1]) || 10;
          const history = await api.miningHistory(limit);
          term.write(JSON.stringify(history, null, 2) + "\r\n");
          break;
        }

        case "stats": {
          const stats = await api.miningStats();
          term.write(JSON.stringify(stats, null, 2) + "\r\n");
          break;
        }

        case "player": {
          const sub = args[1];
          let res;
          if (!sub) {
            res = await api.getPlayer();
          } else if (sub === "online") {
            res = await api.getOnlinePlayers();
          } else if (sub === "scan") {
            res = await api.scanPlayers();
          } else if (sub.startsWith("id:")) {
            const id = sub.slice(3);
            res = await api.getPlayerById(id);
          } else {
            res = await api.getPlayerByUsername(sub);
          }
          term.write(JSON.stringify(res, null, 2) + "\r\n");
          break;
        }
        case "help":
          {
            term.write("\x1b[36mAvailable commands:\x1b[0m\r\n");

            const commands: [string, string][] = [
              ["login", "<username> <password>"],
              ["register", "<username> <password>"],
              ["logout", ""],
              ["start", ""],
              ["stop", ""],
              ["claim", ""],
              ["status", ""],
              ["history", "[limit]"],
              ["stats", ""],
              ["player", "[username|id:<id>|online|scan]"],
              ["help", ""],
              ["exit", ""],
            ];

            const pad = 10; // all command names will be padded to 10 characters
            commands.forEach(([cmd, desc]) => {
              term.write(`  ${cmd.padEnd(pad, " ")} ${desc}\r\n`);
            });

            term.write("\r\n"); 
          }
          break;

        case "exit":
          term.write("Goodbye!\r\n");
          break;

        default:
          term.write(`Unknown command: ${cmd}\r\n`);
          break;
      }
    } catch (err: any) {
      term.write(`Error: ${err.message}\r\n`);
    }
  }
}

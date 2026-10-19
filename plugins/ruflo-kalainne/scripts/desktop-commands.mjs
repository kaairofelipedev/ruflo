#!/usr/bin/env node
import path from "node:path";

export function commandsFor(platform, repoRoot) {
  const win = platform === "win32";
  const lib = win ? path.win32 : path.posix;
  const root = win ? String(repoRoot).replace(/\//g, "\\") : String(repoRoot).replace(/\\/g, "/");
  const route = lib.join(root, "plugins", "ruflo-kalainne", "scripts", "route.mjs");
  const install = lib.join(root, "plugins", "ruflo-kalainne", "scripts", "install.mjs");
  const plugin = (name) => lib.join(root, "plugins", name);
  return {
    platform: win ? "win32" : platform,
    route: `node "${route}" --json "<pedido>"`,
    claude: `claude --plugin-dir "${plugin("ruflo-core")}" --plugin-dir "${plugin("ruflo-agentdb")}" --plugin-dir "${plugin("ruflo-kalainne")}"`,
    install: `node "${install}" --target "<projeto>" --repo "${root}" --surface all`,
    note: "Estes comandos não alteram PATH, MCP nem hooks globais.",
  };
}

function main() {
  const args = process.argv.slice(2);
  let platform = process.platform;
  let repoRoot = process.cwd();
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--platform") platform = args[i + 1];
    if (args[i] === "--repo") repoRoot = args[i + 1];
  }
  process.stdout.write(`${JSON.stringify(commandsFor(platform, repoRoot), null, 2)}\n`);
}

const invokedDirectly = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));
if (invokedDirectly) main();

#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

export const SURFACES = ["cursor", "claude", "codex", "cloud"];
const SYSTEM_DIRS = new Set([
  "/etc",
  "/usr",
  "/bin",
  "/sbin",
  "/var",
  "/home",
  "/Users",
  "/Windows",
  "/Program Files",
]);

function normalizeSurfaces(surfaces) {
  const list = Array.isArray(surfaces) ? surfaces : [];
  if (list.length === 1 && list[0] === "all") return [...SURFACES];
  const unknown = list.filter((item) => !SURFACES.includes(item));
  if (list.length === 0 || unknown.length > 0) {
    throw new Error(`Superfície desconhecida: ${unknown[0] || "(vazia)"}`);
  }
  return [...list];
}

function assertSafeTarget(target) {
  const root = path.parse(target).root;
  if (target === root) throw new Error("Recusa instalar na raiz do sistema.");
  const portable = target.replace(/\\/g, "/").replace(/\/$/, "");
  if (SYSTEM_DIRS.has(portable)) throw new Error("Recusa instalar em diretório de sistema.");
  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    throw new Error("O alvo precisa ser um diretório existente.");
  }
}

function routerDisplay(repoRoot, sameCheckout) {
  if (sameCheckout) return "plugins/ruflo-kalainne/scripts/route.mjs";
  return path.join(repoRoot, "plugins", "ruflo-kalainne", "scripts", "route.mjs").split(path.sep).join("/");
}

function cursorRule(router) {
  return `---
description: Roteia pedidos da Kalainne pelo harness Ruflo antes de executar no desktop ou na nuvem.
alwaysApply: true
---

# Kalainne no Ruflo

Pedido da Kalainne, do Kairo, de marca, de PMO ou deste plugin: rode o roteador e siga o JSON.

\`\`\`bash
node ${router} --json "<pedido>"
\`\`\`

Obedeça \`owners\`, \`reviewers\`, \`gates\`, \`blocked\` e \`memory\`. Não publique, não gaste, não envie mensagem externa e não faça merge. O Notion prevalece sobre a memória.

Pedido de engenharia do próprio Ruflo que não cita a Kalainne não desvia o trabalho.
`;
}

function claudeFragment(router, repoDisplay) {
  return `# Fragmento Claude Code

Cole no projeto. Este arquivo não edita configuração global.

\`\`\`bash
claude --plugin-dir "${repoDisplay}/plugins/ruflo-core" --plugin-dir "${repoDisplay}/plugins/ruflo-agentdb" --plugin-dir "${repoDisplay}/plugins/ruflo-kalainne"
node ${router} --json "<pedido>"
\`\`\`
`;
}

function codexFragment(router) {
  return `# Fragmento Codex

Cole no AGENTS.md do projeto. Este arquivo não edita configuração global.

Antes de um pedido da Kalainne, rode \`node ${router} --json "<pedido>"\` e siga dono, revisor e travas. O Notion prevalece sobre a memória.
`;
}

function cloudNote(router) {
  return `# Nuvem

O Cursor Cloud lê \`.cursor/rules/kalainne.mdc\` deste projeto. Claude Code e Codex na nuvem usam o mesmo roteador:

\`\`\`bash
node ${router} --json "<pedido>"
\`\`\`

Não há segundo catálogo de agentes. Publicar, gastar, enviar e fazer merge continuam com aprovação humana.
`;
}

export function installProfile({ targetDir, repoRoot, surfaces = ["all"] }) {
  if (!targetDir || !repoRoot) throw new Error("targetDir e repoRoot são obrigatórios.");
  const target = path.resolve(targetDir);
  const repo = path.resolve(repoRoot);
  assertSafeTarget(target);
  const selected = normalizeSurfaces(surfaces);
  const sameCheckout = target === repo;
  const storedRoot = sameCheckout ? "." : repo.split(path.sep).join("/");
  const router = routerDisplay(sameCheckout ? repo : repo, sameCheckout);
  const repoDisplay = sameCheckout ? "." : storedRoot;
  const written = [];

  const write = (rel, contents) => {
    const dest = path.resolve(target, rel);
    const relative = path.relative(target, dest);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error("Caminho escapa do projeto.");
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, contents.endsWith("\n") ? contents : `${contents}\n`, "utf8");
    written.push(rel.split(path.sep).join("/"));
  };

  write(".kalainne/profile.json", `${JSON.stringify({
    name: "kalainne-ruflo",
    version: "0.1.0",
    repoRoot: storedRoot,
    router,
    surfaces: selected,
    globalMutation: false,
  }, null, 2)}\n`);

  if (selected.includes("claude")) write(".kalainne/CLAUDE.fragment.md", claudeFragment(router, repoDisplay));
  if (selected.includes("codex")) write(".kalainne/AGENTS.fragment.md", codexFragment(router));
  if (selected.includes("cloud")) write(".kalainne/cloud.md", cloudNote(router));
  if (selected.includes("cursor") || selected.includes("cloud")) write(".cursor/rules/kalainne.mdc", cursorRule(router));

  return { targetDir: target, surfaces: selected, written };
}

function readArg(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function main() {
  const args = process.argv.slice(2);
  const targetDir = readArg(args, "--target");
  const repoRoot = readArg(args, "--repo") || path.resolve(path.dirname(process.argv[1]), "..", "..", "..");
  const surface = readArg(args, "--surface") || "all";
  if (!targetDir) {
    process.stderr.write("Uso: node scripts/install.mjs --target <projeto> --repo <ruflo> --surface all\n");
    process.exit(2);
  }
  const result = installProfile({ targetDir, repoRoot, surfaces: [surface] });
  process.stdout.write(`${result.written.join("\n")}\n`);
}

const invokedDirectly = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));
if (invokedDirectly) main();

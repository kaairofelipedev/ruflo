import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { commandsFor } from "./desktop-commands.mjs";
import { installProfile } from "./install.mjs";

test("comandos Windows não mexem no ambiente global", () => {
  const commands = commandsFor("win32", "D:\\Ruflo");
  assert.equal(commands.platform, "win32");
  assert.match(commands.route, /route\.mjs/);
  assert.match(commands.claude, /ruflo-kalainne/);
  assert.match(commands.install, /--surface all/);
  assert.match(commands.note, /não alteram PATH/i);
  for (const value of Object.values(commands)) {
    assert.equal(String(value).includes("export PATH"), false);
    assert.equal(String(value).includes(".cursor\\mcp"), false);
  }
});

test("comandos Unix usam barra normal", () => {
  const commands = commandsFor("linux", "/opt/ruflo");
  assert.match(commands.route, /\/opt\/ruflo\/plugins\/ruflo-kalainne\/scripts\/route\.mjs/);
  assert.match(commands.claude, /--plugin-dir "\/opt\/ruflo\/plugins\/ruflo-core"/);
});

test("perfil all grava Cursor, Claude, Codex e nuvem sem segredo", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "kalainne-profile-"));
  const repoRoot = "/opt/ruflo";
  const first = installProfile({ targetDir: target, repoRoot, surfaces: ["all"] });
  const expected = [
    ".cursor/rules/kalainne.mdc",
    ".kalainne/AGENTS.fragment.md",
    ".kalainne/CLAUDE.fragment.md",
    ".kalainne/cloud.md",
    ".kalainne/profile.json",
  ];
  assert.deepEqual([...first.written].sort(), expected);

  const profile = JSON.parse(fs.readFileSync(path.join(target, ".kalainne/profile.json"), "utf8"));
  assert.equal(profile.version, "0.1.0");
  assert.equal(profile.globalMutation, false);
  assert.equal(profile.repoRoot, repoRoot);

  const rule = fs.readFileSync(path.join(target, ".cursor/rules/kalainne.mdc"), "utf8");
  assert.match(rule, /route\.mjs/);
  assert.match(rule, /não desvia/);

  const blob = expected.map((rel) => fs.readFileSync(path.join(target, rel), "utf8")).join("\n");
  assert.equal(/sk-|api_key|BEGIN PRIVATE|PINATA/i.test(blob), false);

  const second = installProfile({ targetDir: target, repoRoot, surfaces: ["all"] });
  assert.deepEqual([...second.written].sort(), expected);
});

test("recusa raiz do sistema e superfície desconhecida", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "kalainne-profile-"));
  assert.throws(() => installProfile({ targetDir: path.parse(target).root, repoRoot: target, surfaces: ["cursor"] }), /raiz/i);
  assert.throws(() => installProfile({ targetDir: target, repoRoot: target, surfaces: ["outlook"] }), /desconhecida/i);
});

test("instalação no próprio checkout usa caminho relativo", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "kalainne-profile-"));
  installProfile({ targetDir: target, repoRoot: target, surfaces: ["cursor"] });
  const profile = JSON.parse(fs.readFileSync(path.join(target, ".kalainne/profile.json"), "utf8"));
  assert.equal(profile.repoRoot, ".");
  const rule = fs.readFileSync(path.join(target, ".cursor/rules/kalainne.mdc"), "utf8");
  assert.match(rule, /node plugins\/ruflo-kalainne\/scripts\/route\.mjs/);
  assert.equal(rule.includes(target), false);
});

test("superfície claude não grava a regra do Cursor", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "kalainne-profile-"));
  const result = installProfile({ targetDir: target, repoRoot: target, surfaces: ["claude"] });
  assert.deepEqual(result.written, [".kalainne/profile.json", ".kalainne/CLAUDE.fragment.md"]);
  assert.equal(fs.existsSync(path.join(target, ".cursor/rules/kalainne.mdc")), false);
});

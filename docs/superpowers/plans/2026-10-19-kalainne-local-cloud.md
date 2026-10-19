# Kalainne local e nuvem — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Instalar o harness Ruflo da Kalainne dentro de um projeto, no desktop e na nuvem, sem alterar PATH, MCP ou hooks globais.

**Architecture:** `installProfile` grava regra Cursor e fragmentos Claude, Codex e nuvem dentro do diretório alvo. `commandsFor` imprime os comandos de Windows e Unix. O roteador existente continua a classificar o pedido.

**Tech Stack:** Node.js 20, `node:test`, arquivos Markdown e JSON. Sem dependência nova.

## Global Constraints

- Não alterar PATH, MCP nem hooks globais.
- Não gravar token, chave, senha, preço ou claim.
- Superfícies válidas: `cursor`, `claude`, `codex`, `cloud`, e `all`.
- Versão do perfil: `0.1.0`.
- `globalMutation` no perfil é `false`.
- Alvo inexistente, raiz do sistema ou diretório de sistema é erro.
- Pedido que não é da Kalainne não é desviado pela regra.
- O Notion prevalece sobre a memória do Ruflo.

---

### Task 1: Comandos de desktop

**Files:**

- Create: `plugins/ruflo-kalainne/scripts/desktop-commands.mjs`
- Test: `plugins/ruflo-kalainne/scripts/install.test.mjs`

**Interfaces:**

- Consumes: caminho absoluto do checkout Ruflo.
- Produces: `commandsFor(platform, repoRoot)` devolve `{ platform, route, claude, install, note }`. `platform` é `win32` ou qualquer outro valor tratado como Unix.

- [x] **Step 1: Write the failing test**

```javascript
import assert from "node:assert/strict";
import test from "node:test";
import { commandsFor } from "./desktop-commands.mjs";

test("comandos Windows não mexem no ambiente global", () => {
  const commands = commandsFor("win32", "D:\\Ruflo");
  assert.equal(commands.platform, "win32");
  assert.match(commands.route, /route\.mjs/);
  assert.match(commands.claude, /ruflo-kalainne/);
  assert.match(commands.install, /--surface all/);
  assert.match(commands.note, /não alteram PATH/i);
  for (const value of Object.values(commands)) {
    assert.equal(String(value).includes("export PATH"), false);
  }
});

test("comandos Unix usam barra normal", () => {
  const commands = commandsFor("linux", "/opt/ruflo");
  assert.match(commands.route, /\/opt\/ruflo\/plugins\/ruflo-kalainne\/scripts\/route\.mjs/);
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test plugins/ruflo-kalainne/scripts/install.test.mjs`

Expected: FAIL com módulo ou export ausente.

- [x] **Step 3: Write minimal implementation**

`commandsFor` monta `route`, `claude` e `install` com `path.win32` ou `path.posix`. A nota diz que os comandos não alteram PATH, MCP nem hooks globais.

- [x] **Step 4: Run test to verify it passes**

Run: `node --test plugins/ruflo-kalainne/scripts/install.test.mjs`

Expected: PASS nos dois testes de comando.

- [x] **Step 5: Commit**

```bash
git add plugins/ruflo-kalainne/scripts/desktop-commands.mjs plugins/ruflo-kalainne/scripts/install.test.mjs
git commit -m "feat(kalainne): add desktop command builder"
```

### Task 2: Instalador do perfil

**Files:**

- Create: `plugins/ruflo-kalainne/scripts/install.mjs`
- Modify: `plugins/ruflo-kalainne/scripts/install.test.mjs`
- Modify: `plugins/ruflo-kalainne/scripts/smoke.sh`
- Modify: `plugins/ruflo-kalainne/README.md`

**Interfaces:**

- Consumes: `commandsFor` não é obrigatório aqui.
- Produces: `installProfile({ targetDir, repoRoot, surfaces })` devolve `{ targetDir, surfaces, written }`. `written` usa barras `/`. CLI: `node scripts/install.mjs --target <dir> --repo <dir> --surface all`.

- [x] **Step 1: Write the failing test**

O teste cria um diretório temporário, chama `installProfile` com `surfaces: ["all"]` e verifica:

- existem `.kalainne/profile.json`, `.kalainne/CLAUDE.fragment.md`, `.kalainne/AGENTS.fragment.md`, `.kalainne/cloud.md` e `.cursor/rules/kalainne.mdc`
- `profile.json` tem `version` `0.1.0` e `globalMutation` `false`
- a regra cita `route.mjs` e a frase de não desviar engenharia do Ruflo
- os arquivos não contêm `sk-`, `api_key`, `BEGIN PRIVATE` nem `PINATA`
- a segunda execução devolve a mesma lista
- `installProfile` na raiz do sistema lança erro
- `surfaces: ["outlook"]` lança erro

- [x] **Step 2: Run test to verify it fails**

Run: `node --test plugins/ruflo-kalainne/scripts/install.test.mjs`

Expected: FAIL com `installProfile` ausente.

- [x] **Step 3: Write minimal implementation**

`installProfile` valida o alvo, recusa raízes e diretórios de sistema, grava só os arquivos das superfícies pedidas e impede caminho que escape do alvo.

- [x] **Step 4: Run test to verify it passes**

Run: `node --test plugins/ruflo-kalainne/scripts/install.test.mjs`

Expected: PASS.

Acrescentar o mesmo teste ao `smoke.sh` e documentar no README os comandos de desktop e nuvem.

- [x] **Step 5: Commit**

```bash
git add plugins/ruflo-kalainne/scripts/install.mjs plugins/ruflo-kalainne/scripts/install.test.mjs plugins/ruflo-kalainne/scripts/smoke.sh plugins/ruflo-kalainne/README.md
git commit -m "feat(kalainne): install local and cloud profile inside a project"
```

### Task 3: Perfil deste fork

**Files:**

- Create: `.kalainne/profile.json`
- Create: `.kalainne/CLAUDE.fragment.md`
- Create: `.kalainne/AGENTS.fragment.md`
- Create: `.kalainne/cloud.md`
- Create: `.cursor/rules/kalainne.mdc`

**Interfaces:**

- Consumes: `installProfile` com `targetDir` na raiz deste repositório e `repoRoot` na mesma raiz.
- Produces: o Cursor Cloud e o Cursor local deste checkout leem a regra sem passo manual extra.

- [x] **Step 1: Run the installer against the repo root**

```bash
node plugins/ruflo-kalainne/scripts/install.mjs --target . --repo . --surface all
```

Expected: lista os cinco arquivos.

- [x] **Step 2: Re-run the full test**

Run: `bash plugins/ruflo-kalainne/scripts/smoke.sh`

Expected: exit 0, com o passo do instalador em PASS e os 12 testes do roteador em PASS.

- [x] **Step 3: Commit**

```bash
git add .kalainne .cursor/rules/kalainne.mdc docs/superpowers
git commit -m "feat(kalainne): add the local and cloud profile to this fork"
```

## Spec coverage

- Perfil no projeto: Task 2 e Task 3.
- Comandos Windows e Unix: Task 1.
- Recusa de caminho perigoso e superfície inválida: Task 2.
- Ausência de segredo e de mutação global: Task 1 e Task 2.
- Nuvem lendo a mesma regra: Task 3.
- Canva, Meta Ads e config global: fora do plano, registrados na spec.

## O que só o desktop do Kairo executa

```bash
node plugins/ruflo-kalainne/scripts/install.mjs --target "D:\caminho\do\projeto" --repo "D:\caminho\deste\ruflo" --surface all
node plugins/ruflo-kalainne/scripts/desktop-commands.mjs --platform win32 --repo "D:\caminho\deste\ruflo"
```

Esse passo não faz parte do commit. O instalador já estará no repositório.

#!/usr/bin/env node
/**
 * Roteador determinístico Kalainne (tier 1, sem LLM).
 * Uso: node scripts/route.mjs "pedido em português"
 *      node scripts/route.mjs --json "pedido"
 */
import {
  AGENTS,
  BRAND_SURFACE,
  GATES,
  MEMORY_POLICY,
  RULES,
  SOURCES,
} from "../catalog/kalainne-catalog.mjs";

export function normalize(input) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function hits(text, phrases) {
  return phrases.filter((phrase) => {
    const needle = normalize(phrase);
    if (!needle) return false;
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?:^| )${escaped}(?: |$)`).test(text);
  });
}

function executionFor(ownerIds) {
  if (ownerIds.includes("eng")) {
    return {
      tier: 3,
      where: "ide-local-ou-cursor-cloud",
      models: ["Claude", "Codex", "Grok"],
      plugins: ["ruflo-core", "ruflo-swarm", "ruflo-testgen", "ruflo-jujutsu", "ruflo-kalainne"],
      note: "Implementação e revisão de código. O roteador em si continua no tier 1.",
    };
  }
  if (ownerIds.includes("studio") || ownerIds.includes("visual-pipeline") || ownerIds.includes("growth")) {
    return {
      tier: 2,
      where: "nuvem-mcp",
      models: ["Grok", "Claude"],
      plugins: ["ruflo-core", "ruflo-rag-memory", "ruflo-kalainne"],
      note: "Rascunho e brief. Texto final de marca não passa por LLM local sem a Central de Marca.",
    };
  }
  return {
    tier: 2,
    where: "nuvem-mcp",
    models: ["Grok", "Claude"],
    plugins: ["ruflo-core", "ruflo-agentdb", "ruflo-intelligence", "ruflo-kalainne"],
    note: "Leitura no Notion e no Drive. Gravação de status só como proposta.",
  };
}

/**
 * @param {string} input
 * @param {{ hermesConfirmed?: boolean }} [options]
 */
export function routeTask(input, options = {}) {
  const text = normalize(input);
  let matched = RULES.filter((rule) => hits(text, rule.any).length > 0).map((rule) => rule.id);
  const validation = hits(text, ["validar", "parecer", "compliance", "bloquear"]);
  if (validation.length > 0) {
    const makers = new Set(["growth", "studio", "visual-pipeline"]);
    matched = matched.filter((id) => !makers.has(id));
    if (!matched.includes("brand-guardian")) matched.push("brand-guardian");
  }
  const owners = matched.length > 0 ? matched : ["primary"];
  const mode = matched.length === 0 ? "clarify" : matched.length > 1 ? "split" : "route";

  const brandHits = hits(text, BRAND_SURFACE);
  const reviewers = [];
  if (brandHits.length > 0 && !owners.includes("brand-guardian")) {
    reviewers.push("brand-guardian");
  }

  const gates = GATES.filter((gate) => hits(text, gate.any).length > 0).map((gate) => ({
    id: gate.id,
    action: gate.action,
    reason: gate.reason,
  }));

  const blocked = [];
  const hermesConfirmed = options.hermesConfirmed === true || process.env.KALAINNE_HERMES_CONFIRMED === "1";
  if (owners.includes("hermes-ops") && !hermesConfirmed) {
    blocked.push({
      id: "hermes-stack",
      action: "spec-only",
      reason: "A stack Hermes não está confirmada em produção. Documentar a spec e listar pré-requisitos.",
    });
  }

  const read = [...new Set([...MEMORY_POLICY.sharedRead, ...owners.map((id) => AGENTS[id].namespace)])];
  const write = [...MEMORY_POLICY.sharedWrite];
  if (mode !== "clarify") write.push(MEMORY_POLICY.patternNamespace);

  const confidence = mode === "clarify" ? 0.4 : mode === "split" ? 0.72 : 0.88;

  return {
    input,
    normalized: text,
    mode,
    confidence,
    owners: owners.map(describe),
    reviewers: reviewers.map(describe),
    gates,
    blocked,
    memory: {
      read,
      write: [...new Set(write)],
      forbidden: MEMORY_POLICY.forbidden,
    },
    runtime: {
      router: { tier: 1, where: "local-deterministico", cost: 0 },
      execution: executionFor(owners),
    },
    truth: [...new Set(owners.flatMap((id) => AGENTS[id].truth))],
    sources: SOURCES,
    next: nextStep(mode, owners, gates, blocked),
  };
}

function describe(id) {
  const agent = AGENTS[id];
  return {
    id,
    name: agent.name,
    layer: agent.layer,
    phase: agent.phase,
    namespace: agent.namespace,
  };
}

function nextStep(mode, owners, gates, blocked) {
  if (mode === "clarify") {
    return "Pedido sem dono setorial. O Primary pede objetivo, prazo e fonte de verdade antes de executar.";
  }
  const names = owners.map((id) => AGENTS[id].name).join(", ");
  const gateNote = gates.length > 0 ? ` Travas ativas: ${gates.map((gate) => gate.id).join(", ")}.` : "";
  const blockNote = blocked.length > 0 ? ` Bloqueio: ${blocked.map((item) => item.id).join(", ")}.` : "";
  const prefix = mode === "split" ? `Dividir entre ${names}.` : `Encaminhar para ${names}.`;
  return `${prefix} Ler a memória do namespace e a fonte no Notion. Entregar rascunho ou diagnóstico, sem publicar, gastar ou enviar.${gateNote}${blockNote}`;
}

function main() {
  const args = process.argv.slice(2);
  const asJson = args[0] === "--json";
  const input = (asJson ? args.slice(1) : args).join(" ").trim();
  if (!input) {
    process.stderr.write('Uso: node scripts/route.mjs [--json] "pedido"\n');
    process.exit(2);
  }
  const decision = routeTask(input);
  if (asJson) {
    process.stdout.write(`${JSON.stringify(decision, null, 2)}\n`);
    return;
  }
  const ownerLine = decision.owners.map((agent) => agent.name).join(" + ");
  const reviewerLine = decision.reviewers.map((agent) => agent.name).join(", ") || "nenhum";
  const gateLine = decision.gates.map((gate) => `${gate.id} (${gate.action})`).join(", ") || "nenhuma";
  process.stdout.write(
    [
      `modo: ${decision.mode} (${decision.confidence})`,
      `donos: ${ownerLine}`,
      `revisores: ${reviewerLine}`,
      `travas: ${gateLine}`,
      `memória: ${decision.memory.read.join(", ")}`,
      `execução: tier ${decision.runtime.execution.tier} em ${decision.runtime.execution.where}`,
      `próximo: ${decision.next}`,
    ].join("\n") + "\n",
  );
}

const invokedDirectly = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"));
if (invokedDirectly) main();

import assert from "node:assert/strict";
import test from "node:test";
import { routeTask } from "./route.mjs";

test("validação de marca fica com o Brand Guardian", () => {
  const decision = routeTask("Validar a legenda e bloquear o nome antigo AstroQuat");
  assert.equal(decision.mode, "route");
  assert.deepEqual(decision.owners.map((agent) => agent.id), ["brand-guardian"]);
  assert.equal(decision.reviewers.length, 0);
  assert.ok(decision.gates.some((gate) => gate.id === "unverified-claim") === false);
});

test("arte nova passa pelo pipeline, pelo Studio e pelo Guardian", () => {
  const decision = routeTask("Criar arte 9:16 com brief da fila e legenda do post");
  const ids = decision.owners.map((agent) => agent.id);
  assert.equal(decision.mode, "split");
  assert.ok(ids.includes("visual-pipeline"));
  assert.ok(ids.includes("studio"));
  assert.ok(ids.includes("growth"));
  assert.ok(decision.reviewers.some((agent) => agent.id === "brand-guardian"));
});

test("publicar no Instagram para na trava humana", () => {
  const decision = routeTask("Publicar no Instagram a legenda da pauta de seguidores");
  assert.ok(decision.owners.some((agent) => agent.id === "growth"));
  const publish = decision.gates.find((gate) => gate.id === "publish");
  assert.equal(publish.action, "stop");
  assert.match(decision.next, /publicar|Trava/i);
});

test("pedido de engenharia não faz merge sozinho", () => {
  const decision = routeTask("Abrir PR do site-kalainne e fazer deploy em produção na Vercel");
  assert.deepEqual(decision.owners.map((agent) => agent.id), ["eng"]);
  assert.equal(decision.runtime.execution.tier, 3);
  assert.equal(decision.runtime.execution.where, "ide-local-ou-cursor-cloud");
  assert.ok(decision.gates.some((gate) => gate.id === "production-merge" && gate.action === "stop"));
  assert.ok(decision.memory.read.includes("kalainne-eng"));
  assert.ok(decision.memory.forbidden.some((item) => item.includes("chaves")));
});

test("status e código no mesmo pedido são divididos", () => {
  const decision = routeTask("Atualizar o status do cronograma e abrir PR do drift Lovable");
  const ids = decision.owners.map((agent) => agent.id).sort();
  assert.deepEqual(ids, ["eng", "ops"]);
  assert.equal(decision.mode, "split");
});

test("WhatsApp para lead sai como rascunho do Comercial", () => {
  const decision = routeTask("Enviar WhatsApp de follow-up para o lead do salão");
  assert.ok(decision.owners.some((agent) => agent.id === "comercial"));
  assert.equal(decision.gates.find((gate) => gate.id === "external-message").action, "draft");
});

test("Hermes sem stack confirmada só documenta a spec", () => {
  const decision = routeTask("Ativar o fluxo n8n de WhatsApp Business", { hermesConfirmed: false });
  assert.ok(decision.owners.some((agent) => agent.id === "hermes-ops"));
  assert.equal(decision.blocked[0].action, "spec-only");
});

test("Hermes confirmado remove o bloqueio de spec", () => {
  const decision = routeTask("Documentar o fluxo n8n", { hermesConfirmed: true });
  assert.equal(decision.blocked.length, 0);
});

test("briefing do dia não cai na fila de arte", () => {
  const decision = routeTask("Montar o briefing do dia e a agenda");
  assert.deepEqual(decision.owners.map((agent) => agent.id), ["executive"]);
});

test("pedido vago volta para o Primary", () => {
  const decision = routeTask("me ajuda com uma coisa");
  assert.equal(decision.mode, "clarify");
  assert.equal(decision.owners[0].id, "primary");
  assert.equal(decision.confidence, 0.4);
});

test("preço e desconto não viram claim", () => {
  const decision = routeTask("Qual o preço com cupom de desconto para publicar");
  assert.ok(decision.gates.some((gate) => gate.id === "unverified-claim"));
  assert.ok(decision.gates.some((gate) => gate.id === "publish"));
  assert.ok(decision.reviewers.some((agent) => agent.id === "brand-guardian") || decision.owners.some((agent) => agent.id === "brand-guardian"));
});

test("reclamação de cliente vai para Care com handoff implícito na trava", () => {
  const decision = routeTask("Cliente com reclamação e pedido de troca");
  assert.deepEqual(decision.owners.map((agent) => agent.id), ["care"]);
  assert.ok(decision.memory.read.includes("kalainne-care"));
});

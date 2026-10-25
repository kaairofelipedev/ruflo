/**
 * Catálogo operacional da Kalainne Professional para o harness Ruflo.
 * Fonte de verdade das personas: plano Grok Bot v1.0 (06/10/2026) e
 * registro do Projeto Intellig (renovado até 31/12/2026).
 * Este arquivo não copia claims de produto. Aponta para o Notion.
 */

export const SOURCES = {
  plan: "https://app.notion.com/p/3f28ee79657981888c7cd18ce128f144",
  hub: "https://app.notion.com/p/3398ee796579800b8d2ff8733d60cd58",
  project: "https://app.notion.com/p/3208ee7965798065ab8afc50ab3f1396",
  registry: "https://app.notion.com/p/3f28ee796579819aab45d912e985c26a",
  brand: "https://app.notion.com/p/3748ee79657981258597c705bda3c455",
  faq: "https://app.notion.com/p/3f28ee796579818db118ed0cd3a0d2ea",
  hermes: "https://app.notion.com/p/3f28ee79657981de9be4e792ed793a98",
  visual: "https://app.notion.com/p/37b8ee79657981fb9d8cedff38aa2b5f",
  tech: "https://app.notion.com/p/3398ee79657981ebb117fd1b68433a22",
};

export const AGENTS = {
  primary: {
    name: "Grok Bot Primary",
    layer: 1,
    phase: 1,
    namespace: "kalainne-routing",
    truth: [SOURCES.plan, SOURCES.hub],
  },
  studio: {
    name: "Kalainne Studio",
    layer: 2,
    phase: 1,
    namespace: "kalainne-visual",
    truth: [SOURCES.brand, SOURCES.visual],
  },
  kairos: {
    name: "Kairós Grokado",
    layer: 3,
    phase: 1,
    namespace: "kalainne-stack",
    truth: [SOURCES.plan],
  },
  eggbot: {
    name: "dr eggbot",
    layer: 4,
    phase: 1,
    namespace: "kalainne-agents",
    truth: [SOURCES.plan, SOURCES.registry],
  },
  "brand-guardian": {
    name: "Kalainne Brand Guardian",
    layer: 2,
    phase: 1,
    namespace: "kalainne-brand",
    truth: [SOURCES.brand, SOURCES.plan],
  },
  ops: {
    name: "Kalainne Ops",
    layer: 2,
    phase: 1,
    namespace: "kalainne-pmo",
    truth: [SOURCES.hub, SOURCES.project],
  },
  "visual-pipeline": {
    name: "Kalainne Visual Pipeline",
    layer: 2,
    phase: 1,
    namespace: "kalainne-visual",
    truth: [SOURCES.visual, SOURCES.brand],
  },
  eng: {
    name: "Kalainne Eng",
    layer: 2,
    phase: 1,
    namespace: "kalainne-eng",
    truth: [SOURCES.plan, SOURCES.tech],
  },
  growth: {
    name: "Kalainne Growth",
    layer: 2,
    phase: 2,
    namespace: "kalainne-growth",
    truth: [SOURCES.hub, SOURCES.brand],
  },
  comercial: {
    name: "Kalainne Comercial",
    layer: 2,
    phase: 2,
    namespace: "kalainne-crm",
    truth: [SOURCES.project, SOURCES.brand],
  },
  care: {
    name: "Kalainne Care",
    layer: 2,
    phase: 2,
    namespace: "kalainne-care",
    truth: [SOURCES.faq, SOURCES.brand],
  },
  "hermes-ops": {
    name: "Kalainne Hermes Ops",
    layer: 2,
    phase: 3,
    namespace: "kalainne-hermes",
    truth: [SOURCES.hermes],
  },
  executive: {
    name: "Kairo Executive",
    layer: 3,
    phase: 3,
    namespace: "kalainne-executive",
    truth: [SOURCES.hub, SOURCES.project],
  },
};

/** Regras em ordem estável. Várias podem casar: o pedido é dividido. */
export const RULES = [
  {
    id: "eggbot",
    any: ["criar bot", "novo bot", "nova persona", "aposentar bot", "dr eggbot", "fabrica de bots"],
  },
  {
    id: "executive",
    any: ["briefing do dia", "agenda", "reuniao", "top 3", "prioridades do ceo", "bloco de foco"],
  },
  {
    id: "kairos",
    any: ["organizar pasta", "microsoft 365", "conector", "gmail", "planilha pessoal", "kairós", "kairos grokado"],
  },
  {
    id: "eng",
    any: [
      "site-kalainne",
      "site kalainne",
      "lovable",
      "supabase",
      "pull request",
      "abrir pr",
      "ci falhou",
      "drift",
      "salon pro",
      "expert guide",
      "vercel",
      "deploy",
    ],
  },
  {
    id: "hermes-ops",
    any: ["n8n", "hermes", "fluxo de whatsapp", "whatsapp business", "automacao de mensagem"],
  },
  {
    id: "care",
    any: ["reclamacao", "alergia", "faq", "duvida de cliente", "troca", "devolucao", "atendimento", "reacao adversa"],
  },
  {
    id: "comercial",
    any: ["follow-up", "follow up", "crm", "lead", "pipeline b2b", "prospeccao", "parceiro", "salao"],
  },
  {
    id: "ops",
    any: ["cronograma", "pmo", "sprint", "status do dia", "excel master", "tarefa atrasada", "ata da reuniao"],
  },
  {
    id: "visual-pipeline",
    any: ["brief", "fila de arte", "operacao visual", "biblioteca de prompt", "prompt aprovado"],
  },
  {
    id: "studio",
    any: ["criar arte", "peca", "carrossel", "pptx", "9 16", "16 9", "capa de reels", "8k"],
  },
  {
    id: "growth",
    any: ["calendario editorial", "seguidores", "meta ads", "legenda", "pauta", "alcance", "salvamento"],
  },
  {
    id: "brand-guardian",
    any: ["validar", "parecer", "compliance", "astroquat", "claim", "tipografia", "brand guardian", "nome antigo"],
  },
];

export const BRAND_SURFACE = [
  "arte",
  "legenda",
  "post",
  "reel",
  "carrossel",
  "claim",
  "preco",
  "desconto",
  "produto",
  "persona",
  "marca",
  "tipografia",
  "logo",
  "instagram",
  "faq",
  "pagina",
];

export const GATES = [
  {
    id: "publish",
    action: "stop",
    any: ["publicar", "postar", "agendar publicacao", "subir no instagram"],
    reason: "Publicação em canal é humana. Entregar o pacote e parar.",
  },
  {
    id: "spend",
    action: "stop",
    any: ["verba", "orcamento de ads", "alterar campanha", "conceder desconto", "assinatura paga"],
    reason: "Gasto, verba e condição comercial exigem aprovação explícita do Kairo.",
  },
  {
    id: "external-message",
    action: "draft",
    any: ["enviar email", "mandar email", "enviar whatsapp", "mandar whatsapp", "enviar dm", "enviar mensagem"],
    reason: "Mensagem externa sai como rascunho. Envio só com pedido explícito.",
  },
  {
    id: "production-merge",
    action: "stop",
    any: ["merge", "em producao", "deploy em producao", "fazer deploy"],
    reason: "Merge e deploy de produção exigem aprovação humana.",
  },
  {
    id: "unverified-claim",
    action: "stop",
    any: ["inventar preco", "qual o preco", "prometer resultado", "dar desconto", "cupom"],
    reason: "Preço, desconto e resultado só existem se estiverem na base de produtos. Sem fonte, sem claim.",
  },
];

export const MEMORY_POLICY = {
  sharedRead: ["kalainne-routing"],
  sharedWrite: ["kalainne-routing"],
  patternNamespace: "kalainne-patterns",
  forbidden: [
    "claims de produto",
    "preços e descontos",
    "tokens, chaves e senhas",
    "dados financeiros sensíveis",
    "conteúdo que substitua a Central de Marca ou a FAQ",
  ],
};

# ruflo-kalainne

Harness Ruflo para a Kalainne Professional. O plugin roteia cada pedido para um dos 13 agentes já definidos no plano Grok Bot, guarda memória operacional e impede publicação, gasto, envio e merge sem aprovação.

O Notion continua sendo a fonte de verdade. O Ruflo não vira um segundo PMO nem um segundo manual de marca.

## Carregar

```bash
claude --plugin-dir plugins/ruflo-core --plugin-dir plugins/ruflo-agentdb --plugin-dir plugins/ruflo-kalainne
```

Engenharia de produto acrescenta `ruflo-swarm`, `ruflo-testgen` e `ruflo-jujutsu`. Busca de decisões anteriores acrescenta `ruflo-rag-memory` e `ruflo-intelligence`. Modelo local, via `ruflo-ruvllm`, só classifica ou rascunha o que não é texto final de marca.

## Roteador

```bash
node plugins/ruflo-kalainne/scripts/route.mjs "abrir PR do site-kalainne e atualizar o cronograma"
node plugins/ruflo-kalainne/scripts/route.mjs --json "publicar a legenda no Instagram"
```

A classificação é tier 1: JavaScript local, custo zero, mesmo resultado em Cursor local, Cursor Cloud, Claude Code e Codex. O campo `execution` diz se o trabalho seguinte roda em IDE ou nos conectores MCP.

## O que entra na memória

Namespaces `kalainne-routing`, `kalainne-patterns`, `kalainne-pmo`, `kalainne-eng`, `kalainne-brand`, `kalainne-visual`, `kalainne-growth`, `kalainne-crm`, `kalainne-care`, `kalainne-hermes`, `kalainne-executive`, `kalainne-stack` e `kalainne-agents`.

Cada registro aponta para a página do Notion, a data e a trava aplicada. Não entram claims, preços, segredos nem dados financeiros.

## Travas

| Situação | Comportamento |
|----------|----------------|
| Publicar, gastar, merge, claim sem fonte | para |
| E-mail, DM, WhatsApp | rascunho |
| Fluxo Hermes sem stack confirmada | só a spec |
| Peça ou texto de marca | parecer do Brand Guardian |

Para tratar a stack Hermes como existente: `KALAINNE_HERMES_CONFIRMED=1`.

## Desktop, Cursor e nuvem

O instalador grava o perfil dentro do projeto. Não altera PATH, MCP nem hooks globais.

```bash
node plugins/ruflo-kalainne/scripts/install.mjs --target "<projeto>" --repo "<checkout-deste-ruflo>" --surface all
node plugins/ruflo-kalainne/scripts/desktop-commands.mjs --platform win32 --repo "<checkout-deste-ruflo>"
```

No próprio checkout, `--target` e `--repo` apontam para a raiz. A regra fica em `.cursor/rules/kalainne.mdc` e vale para o Cursor local e para o Cursor Cloud. Claude Code e Codex recebem fragmentos em `.kalainne/` para colar no projeto.

## Verificação

```bash
bash plugins/ruflo-kalainne/scripts/smoke.sh
```

Contrato: [ADR 0001](docs/adrs/0001-kalainne-contract.md).

Plano de origem: [Grok Bot — Plano Estratégico de Agentes Kalainne 2026](https://app.notion.com/p/3f28ee79657981888c7cd18ce128f144).

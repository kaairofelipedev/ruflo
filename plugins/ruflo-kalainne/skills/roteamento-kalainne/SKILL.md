---
name: roteamento-kalainne
description: Classifica um pedido da Kalainne e devolve o agente dono, o revisor, as travas e o runtime antes de qualquer execução
argument-hint: "<pedido>"
allowed-tools: Bash Read
---

# Roteamento Kalainne

Use esta skill antes de executar um pedido da Kalainne Professional ou do Kairo. O classificador é determinístico e não chama modelo.

## Quando usar

Todo pedido que envolva marca, PMO, arte, código, CRM, atendimento, agenda ou automação. Não use os 98 agentes genéricos do Ruflo no lugar dos 13 donos do plano.

## Passos

1. Rode o roteador e leia o JSON:

```bash
node plugins/ruflo-kalainne/scripts/route.mjs --json "$ARGUMENTS"
```

2. Se `mode` for `clarify`, peça objetivo, prazo e fonte de verdade. Não execute.
3. Se `mode` for `split`, entregue cada parte ao dono indicado, com o mesmo contexto.
4. Se houver `reviewers`, a saída que toca marca passa pelo Kalainne Brand Guardian antes de ser considerada pronta.
5. Se houver `gates` com `action: stop`, produza o pacote e pare. Publicação, gasto, merge e claim sem fonte não seguem.
6. Se houver `gates` com `action: draft`, entregue rascunho. Não envie.
7. Se `blocked` contiver `hermes-stack`, apenas documente a spec.
8. Leia a memória listada em `memory.read` com `memory_search` no namespace indicado. Não grave claims, preços, segredos nem dados financeiros.
9. Execute no `runtime.execution.where` e no tier indicado. O roteador em si permanece no tier 1.

## Fontes

O campo `truth` traz as páginas do Notion. Elas prevalecem sobre a memória do Ruflo.

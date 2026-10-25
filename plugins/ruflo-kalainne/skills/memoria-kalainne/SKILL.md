---
name: memoria-kalainne
description: Lê e grava memória operacional da Kalainne em namespaces do Ruflo sem substituir o Notion
argument-hint: "<namespace> <consulta>"
allowed-tools: Bash mcp__claude-flow__memory_search mcp__claude-flow__memory_retrieve mcp__claude-flow__memory_store
---

# Memória Kalainne

A memória do Ruflo guarda decisão, padrão e handoff. A fonte de verdade continua no Notion.

## Namespaces

| Namespace | O que entra | O que não entra |
|-----------|-------------|-----------------|
| `kalainne-routing` | pedido, dono, trava, resultado do roteador | texto de campanha |
| `kalainne-patterns` | o que funcionou em engenharia, PMO e roteamento | claim de produto |
| `kalainne-pmo` | divergência encontrada e proposta de correção | sobrescrita do cronograma |
| `kalainne-eng` | causa raiz, PR, como testar | segredo, env, token |
| `kalainne-brand` | tipo de violação recorrente, sem copiar a peça | preço, desconto, nome inventado |
| `kalainne-visual` | status da fila e link do arquivo | binário da arte |
| `kalainne-growth` | leitura de KPI com data e fonte | métrica sem origem |
| `kalainne-crm` | próximo passo e estágio já registrados | mensagem enviada |
| `kalainne-care` | pergunta sem resposta para virar FAQ | diagnóstico |
| `kalainne-hermes` | spec e pré-requisito | fluxo ativo não aprovado |
| `kalainne-executive` | prioridade sugerida | aceite de convite |
| `kalainne-stack` | saúde de conector | credencial |
| `kalainne-agents` | versão de persona e motivo | persona publicada sem o Guardian |

## Passos

1. Busque antes de agir:

```bash
npx ruflo memory search --query "$ARGUMENTS" --namespace kalainne-routing
```

2. Grave depois de um resultado verificável, com data, fonte Notion e o que não foi feito:

```bash
npx ruflo memory store --key "decisao-$(date +%Y%m%d%H%M)" --namespace kalainne-routing --value "<decisão, dono, trava, link>"
```

3. Padrão reutilizável de engenharia ou de roteamento vai para `kalainne-patterns`.
4. Se a busca discordar do Notion, prevalece o Notion. A memória fica marcada como desatualizada na próxima gravação.

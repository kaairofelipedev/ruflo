---
name: governanca-kalainne
description: Aplica as travas da Kalainne antes de publicar, gastar, enviar mensagem, fazer merge ou afirmar claim
argument-hint: "<saída a revisar>"
allowed-tools: Bash Read
---

# Governança Kalainne

Rode o roteador na saída proposta. As travas abaixo são obrigatórias em qualquer IDE, modelo ou nuvem.

## Travas

| Trava | Ação | Quem libera |
|-------|------|-------------|
| `publish` | parar | Kairo, no canal |
| `spend` | parar | Kairo, por escrito |
| `external-message` | rascunho | pedido explícito de envio |
| `production-merge` | parar | aprovação humana no PR |
| `unverified-claim` | parar | frase presente na base de produtos ou na FAQ |
| `hermes-stack` | só spec | stack confirmada em produção |

## Checklist do Brand Guardian

Quando o roteador incluir o revisor, a saída só fica pronta com parecer APROVADO, AJUSTAR ou BLOQUEADO. Sem verificação, o parecer é AJUSTAR. Não aprove nome antigo, desconto sem registro, fonte fora do padrão ou claim sem fonte.

## O que nenhum runtime faz

- Publicar em Instagram, site, marketplace ou anúncio.
- Enviar e-mail, DM, WhatsApp ou Slack externo.
- Alterar verba, campanha, preço ou condição comercial.
- Fazer merge ou mudar variável de produção.
- Gravar segredo em PR, Notion, log ou memória.
- Tratar o dashboard de BI e o Botpress de abril de 2026 como sistema em produção. São especificação.

## Modelos e IDEs

O tier 1 deste plugin classifica sem modelo. Claude, Codex, Grok e um modelo local via `ruflo-ruvllm` executam o trabalho do dono. Modelo local não redige claim nem texto final de marca. Cursor local e Cursor Cloud executam engenharia. Lovable, Vercel e Supabase são lidos pelo Kalainne Eng e não recebem merge automático.

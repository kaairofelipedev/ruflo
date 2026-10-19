# Kalainne local e nuvem — desenho

Data: 2026-10-19. Repositório: `github.com/kaairofelipedev/ruflo`. Plugin existente: `plugins/ruflo-kalainne`.

## Problema

O roteador determinístico já escolhe o agente, a trava e a memória. Ele ainda não chega ao desktop, aos projetos do Cursor, ao Claude Code, ao Codex e ao agente de nuvem como um perfil repetível. Instalar isso alterando PATH, MCP ou hooks globais fica fora deste corte.

## Decisão

Um instalador grava um perfil dentro do projeto alvo. O mesmo perfil serve ao Cursor local, ao Claude Code, ao Codex e ao Cursor Cloud. A classificação continua em `plugins/ruflo-kalainne/scripts/route.mjs`.

Três caminhos foram comparados:

1. Perfil dentro do projeto. Recomendado. Cada repositório Kalainne fica igual, e nada global muda.
2. Escrita em `~/.cursor`, `~/.claude` e no PATH. Rejeitado. Exige aprovação explícita e vaza a Kalainne para projetos alheios.
3. Aplicativo separado do Ruflo. Rejeitado. Duplicaria o harness que já existe neste fork.

## Unidades

| Unidade | Faz | Uso | Depende de |
|---------|-----|-----|------------|
| `installProfile` | Grava o perfil no diretório alvo | `node scripts/install.mjs --target <projeto> --surface all` | Catálogo e roteador já publicados |
| `commandsFor` | Mostra os comandos de Windows e Unix | `node scripts/desktop-commands.mjs --platform win32` | Caminho do checkout do Ruflo |
| Regra Cursor | Manda rotear pedidos da Kalainne antes de executar | `.cursor/rules/kalainne.mdc` | Roteador |
| Fragmentos Claude e Codex | Texto para colar no projeto, sem editar config global | `.kalainne/CLAUDE.fragment.md`, `.kalainne/AGENTS.fragment.md` | Roteador |
| Nota de nuvem | Diz como o agente de nuvem lê a mesma regra | `.kalainne/cloud.md` | Regra Cursor |

## Superfícies

`cursor`, `claude`, `codex`, `cloud`. `--surface all` grava as quatro. Superfície desconhecida encerra com erro.

## Arquivos gravados

- `.kalainne/profile.json` — versão `0.1.0`, raiz do Ruflo, superfícies, `globalMutation: false`
- `.kalainne/CLAUDE.fragment.md`
- `.kalainne/AGENTS.fragment.md`
- `.kalainne/cloud.md`
- `.cursor/rules/kalainne.mdc` quando a superfície `cursor` ou `cloud` está ativa

Nenhum arquivo recebe token, chave ou senha. O modelo MCP não é escrito: cada IDE conecta pelo próprio login.

## Regras de caminho

- O alvo existe e é diretório.
- O alvo não é a raiz do sistema nem `/etc`, `/usr`, `/bin`, `/sbin`, `/var`, `/home`, `/Users`, `/Windows` ou `/Program Files`.
- Nenhum arquivo gravado escapa do alvo.
- Rodar de novo sobrescreve os mesmos caminhos e não cria cópia extra.

## Comportamento nas IDEs

Pedido da Kalainne, do Kairo, de marca, de PMO ou deste plugin: rodar o roteador e obedecer dono, revisor, trava e memória. Pedido de engenharia do próprio Ruflo que não cita a Kalainne: a regra não desvia o trabalho.

Publicar, gastar, enviar mensagem externa e fazer merge continuam parados. O Notion prevalece sobre a memória do Ruflo.

## Nuvem

O Cursor Cloud deste fork lê `.cursor/rules/kalainne.mdc` do repositório. Claude Code e Codex na nuvem usam o mesmo comando de roteador e os mesmos `--plugin-dir`. Não há segundo catálogo de agentes.

## Fora deste corte

Autenticação de Canva e Meta Ads. Cópia de preço ou FAQ para o Git. Alteração de PATH, MCP ou hooks globais. Execução dentro do desktop Windows do Kairo: o instalador fica pronto para ele rodar lá.

## Teste

`node --test plugins/ruflo-kalainne/scripts/install.test.mjs` cobre gravação, idempotência, recusa de raiz e de superfície inválida, ausência de segredo e comandos de `win32` e Unix.

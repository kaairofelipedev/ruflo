# ADR 0001 — Ruflo como harness da Kalainne, não como segundo catálogo de agentes

## Contexto

O plano de agentes de 06/10/2026 fixa 13 personas, uma fonte de verdade por tema e aprovação humana para publicação, gasto, mensagem externa e merge. O Ruflo oferece swarm, memória, hooks e dezenas de agentes genéricos de engenharia.

## Decisão

O plugin `ruflo-kalainne` adiciona o Ruflo ao ecossistema como runtime:

- um roteador determinístico escolhe o dono do plano;
- a memória fica em namespaces operacionais e não substitui o Notion;
- travas de governança são código, testadas, iguais em IDE local e em agente de nuvem;
- engenharia usa swarm, testes e revisão de diff;
- marca, CRM, atendimento e PMO usam os conectores MCP e param nas travas.

Não se cria um agente Ruflo para cada pessoa da marca. O catálogo aprovado continua o catálogo.

## Consequências

Pedidos compostos são divididos. Validação de peça tira a criação do caminho crítico e deixa o Brand Guardian como dono. Hermes sem stack confirmada só documenta. Claims de produto não entram no repositório nem na memória.

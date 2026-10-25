---
name: kalainne
description: Roteia um pedido da Kalainne para o agente dono, com memória e travas
---
$ARGUMENTS

Classifique o pedido com o roteador determinístico:

```bash
node plugins/ruflo-kalainne/scripts/route.mjs --json "$ARGUMENTS"
```

Mostre dono, revisor, travas, namespaces e o próximo passo. Execute somente a parte permitida pelas travas. Não publique, não envie mensagem externa e não faça merge.

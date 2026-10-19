# Fragmento Claude Code

Cole no projeto. Este arquivo não edita configuração global.

```bash
claude --plugin-dir "./plugins/ruflo-core" --plugin-dir "./plugins/ruflo-agentdb" --plugin-dir "./plugins/ruflo-kalainne"
node plugins/ruflo-kalainne/scripts/route.mjs --json "<pedido>"
```

#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PASS=0
FAIL=0
step() { printf "→ %s ... " "$1"; }
ok()   { printf "PASS\n"; PASS=$((PASS+1)); }
bad()  { printf "FAIL: %s\n" "$1"; FAIL=$((FAIL+1)); }

step "1. plugin.json 0.1.0 com autor e palavras-chave"
v=$(grep -E '"version"' "$ROOT/.claude-plugin/plugin.json" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
if [[ "$v" != "0.1.0" ]]; then bad "expected 0.1.0, got '$v'"; else
  miss=""
  for k in kalainne routing memory governance; do
    grep -q "\"$k\"" "$ROOT/.claude-plugin/plugin.json" || miss="$miss $k"
  done
  [[ -z "$miss" ]] && ok || bad "missing keywords:$miss"
fi

step "2. skills, agent e command com frontmatter"
miss=""
for s in roteamento-kalainne memoria-kalainne governanca-kalainne; do
  f="$ROOT/skills/$s/SKILL.md"
  [[ -f "$f" ]] || { miss="$miss missing-$s"; continue; }
  for k in 'name:' 'description:'; do
    grep -q "^$k" "$f" || miss="$miss $s-no-$k"
  done
done
[[ -f "$ROOT/agents/kalainne-router.md" ]] || miss="$miss missing-agent"
[[ -f "$ROOT/commands/kalainne.md" ]] || miss="$miss missing-command"
[[ -z "$miss" ]] && ok || bad "$miss"

step "3. catálogo não embute claim de produto"
if grep -R -n -E 'AstroQuat-V3|R\$ [0-9]' "$ROOT/catalog" >/dev/null; then
  bad "catalog contém claim ou nome bloqueado como dado"
else
  ok
fi

step "4. roteador determinístico"
if node --test "$ROOT/scripts/route.test.mjs"; then
  ok
else
  bad "node --test falhou"
fi

printf "\n%d passed, %d failed\n" "$PASS" "$FAIL"
[[ "$FAIL" -eq 0 ]]

#!/usr/bin/env bash
# Sincroniza .env.dev e .env.master como GitHub Secrets (ENV_DEV, ENV_MASTER).
# Rodar a partir da raiz do repositório sempre que editar um dos .env.
#
# Uso:
#   bash scripts/sync-env-secrets.sh           # sobe os dois
#   bash scripts/sync-env-secrets.sh dev       # sobe só ENV_DEV
#   bash scripts/sync-env-secrets.sh master    # sobe só ENV_MASTER

set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI não encontrado. Instale em https://cli.github.com/"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "gh não autenticado. Rode: gh auth login"
  exit 1
fi

target="${1:-all}"

upload() {
  local name="$1"
  local file="$2"
  if [ ! -f "$file" ]; then
    echo "Arquivo $file não existe. Pulando $name."
    return
  fi
  echo "Subindo $name a partir de $file..."
  gh secret set "$name" < "$file"
}

case "$target" in
  dev)    upload ENV_DEV .env.dev ;;
  master) upload ENV_MASTER .env.master ;;
  all)
    upload ENV_DEV .env.dev
    upload ENV_MASTER .env.master
    ;;
  *)
    echo "Uso: $0 [dev|master|all]"
    exit 1
    ;;
esac

echo "Feito. Secrets atuais:"
gh secret list

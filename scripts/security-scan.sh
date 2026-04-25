#!/bin/bash
# =============================================================================
# security-scan.sh — Roda todos os scans de seguranca do projeto
#
# Uso:
#   npm run security          → roda TUDO
#   npm run security:deps     → so dependencias (npm audit + trivy)
#   npm run security:code     → so codigo (semgrep)
#   npm run security:secrets  → so secrets (gitleaks)
#   npm run security:docker   → so Docker (hadolint + trivy image)
#
# Cada scan gera um relatorio em ./security-reports/
# =============================================================================

set -o pipefail

# --- Config ---
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPORTS_DIR="$PROJECT_DIR/security-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SCAN_MODE="${1:-all}"

# --- Cores ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# --- Contadores ---
TOTAL=0
PASSED=0
FAILED=0
SKIPPED=0

mkdir -p "$REPORTS_DIR"

# --- Helpers ---
print_header() {
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}  $1${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

run_scan() {
  local name="$1"
  local report_file="$2"
  shift 2
  local cmd=("$@")

  TOTAL=$((TOTAL + 1))
  echo ""
  echo -e "${YELLOW}▶ Executando: ${name}${NC}"
  echo -e "  Comando: ${cmd[*]}"
  echo -e "  Relatorio: ${report_file}"
  echo ""

  if eval "${cmd[@]}" > "$report_file" 2>&1; then
    echo -e "${GREEN}  ✓ ${name}: PASSOU (sem vulnerabilidades encontradas)${NC}"
    PASSED=$((PASSED + 1))
  else
    local exit_code=$?
    echo -e "${RED}  ✗ ${name}: ENCONTROU PROBLEMAS (exit code: ${exit_code})${NC}"
    echo -e "  Veja detalhes em: ${report_file}"
    # Mostra resumo (ultimas 20 linhas)
    echo ""
    echo -e "${YELLOW}  --- Resumo (ultimas 20 linhas) ---${NC}"
    tail -20 "$report_file" | sed 's/^/  /'
    echo ""
    FAILED=$((FAILED + 1))
  fi
}

skip_scan() {
  local name="$1"
  local reason="$2"
  TOTAL=$((TOTAL + 1))
  SKIPPED=$((SKIPPED + 1))
  echo -e "${YELLOW}  ⊘ ${name}: PULADO (${reason})${NC}"
}

# Detecta se a ferramenta esta disponivel (binario local OU via docker)
has_tool() {
  command -v "$1" &>/dev/null
}

has_docker_image() {
  docker image inspect "$1" &>/dev/null 2>&1
}

# Converte path do Windows para formato Docker mount (C:/foo → /c/foo ou //c/foo)
docker_path() {
  local p="$1"
  # Se ja comeca com /, nao converte
  if [[ "$p" == /* ]]; then
    echo "$p"
  else
    # C:\foo\bar → /c/foo/bar
    echo "$p" | sed 's|\\|/|g' | sed 's|^\([A-Za-z]\):|/\L\1|'
  fi
}

# =============================================================================
echo ""
echo -e "${BOLD}=========================================="
echo "  Love Cosmetics — Security Scan"
echo "  $(date)"
echo -e "==========================================${NC}"
echo ""
echo "  Projeto: $PROJECT_DIR"
echo "  Modo: $SCAN_MODE"
echo "  Relatorios: $REPORTS_DIR"

cd "$PROJECT_DIR"

DOCKER_PROJECT_PATH=$(docker_path "$PROJECT_DIR")

# =============================================================================
# 1. DEPENDENCIAS (SCA)
# =============================================================================
if [[ "$SCAN_MODE" == "all" || "$SCAN_MODE" == "deps" ]]; then
  print_header "1/5 — ANALISE DE DEPENDENCIAS (SCA)"

  # --- npm audit ---
  run_scan \
    "npm audit" \
    "$REPORTS_DIR/npm-audit_${TIMESTAMP}.txt" \
    "npm audit --audit-level=moderate 2>&1 || true; npm audit --json 2>/dev/null | head -500"

  # --- Trivy filesystem ---
  if has_tool trivy; then
    run_scan \
      "Trivy (filesystem scan)" \
      "$REPORTS_DIR/trivy-fs_${TIMESTAMP}.txt" \
      "trivy fs --severity HIGH,CRITICAL --scanners vuln ."
  elif has_docker_image "ghcr.io/aquasecurity/trivy"; then
    run_scan \
      "Trivy (filesystem scan via Docker)" \
      "$REPORTS_DIR/trivy-fs_${TIMESTAMP}.txt" \
      "MSYS_NO_PATHCONV=1 docker run --rm -v \"${DOCKER_PROJECT_PATH}:/project\" ghcr.io/aquasecurity/trivy:latest fs --severity HIGH,CRITICAL --scanners vuln /project"
  else
    skip_scan "Trivy (filesystem)" "trivy nao instalado — rode: bash scripts/security-install.sh"
  fi
fi

# =============================================================================
# 2. ANALISE DE CODIGO (SAST)
# =============================================================================
if [[ "$SCAN_MODE" == "all" || "$SCAN_MODE" == "code" ]]; then
  print_header "2/5 — ANALISE ESTATICA DE CODIGO (SAST)"

  # --- Semgrep ---
  if has_tool semgrep; then
    run_scan \
      "Semgrep (SAST)" \
      "$REPORTS_DIR/semgrep_${TIMESTAMP}.txt" \
      "semgrep scan --config auto --severity WARNING --severity ERROR --no-git-ignore --exclude='node_modules' --exclude='.next' --max-target-bytes 1000000 ."
  elif has_docker_image "semgrep/semgrep"; then
    run_scan \
      "Semgrep (SAST via Docker)" \
      "$REPORTS_DIR/semgrep_${TIMESTAMP}.txt" \
      "MSYS_NO_PATHCONV=1 docker run --rm -v \"${DOCKER_PROJECT_PATH}:/src\" semgrep/semgrep:latest semgrep scan --config auto --severity WARNING --severity ERROR --exclude='node_modules' --exclude='.next' --max-target-bytes 1000000 /src"
  else
    skip_scan "Semgrep (SAST)" "semgrep nao instalado — rode: bash scripts/security-install.sh"
  fi

  # --- ESLint (ja existente) ---
  run_scan \
    "ESLint (lint existente)" \
    "$REPORTS_DIR/eslint_${TIMESTAMP}.txt" \
    "npx next lint --no-cache 2>&1 || true"
fi

# =============================================================================
# 3. DETECCAO DE SECRETS
# =============================================================================
if [[ "$SCAN_MODE" == "all" || "$SCAN_MODE" == "secrets" ]]; then
  print_header "3/5 — DETECCAO DE SECRETS"

  if has_tool gitleaks; then
    run_scan \
      "Gitleaks (secrets no codigo)" \
      "$REPORTS_DIR/gitleaks_${TIMESTAMP}.txt" \
      "gitleaks detect --source . --no-banner -v"
  elif has_docker_image "ghcr.io/gitleaks/gitleaks"; then
    run_scan \
      "Gitleaks (secrets via Docker)" \
      "$REPORTS_DIR/gitleaks_${TIMESTAMP}.txt" \
      "MSYS_NO_PATHCONV=1 docker run --rm -v \"${DOCKER_PROJECT_PATH}:/project\" ghcr.io/gitleaks/gitleaks:latest detect --source /project --no-banner -v"
  else
    skip_scan "Gitleaks" "gitleaks nao instalado — rode: bash scripts/security-install.sh"
  fi
fi

# =============================================================================
# 4. DOCKERFILE LINT + CONTAINER SCAN
# =============================================================================
if [[ "$SCAN_MODE" == "all" || "$SCAN_MODE" == "docker" ]]; then
  print_header "4/5 — DOCKER SECURITY"

  # --- Hadolint ---
  if [ -f "Dockerfile" ]; then
    if has_tool hadolint; then
      run_scan \
        "Hadolint (Dockerfile lint)" \
        "$REPORTS_DIR/hadolint_${TIMESTAMP}.txt" \
        "hadolint Dockerfile"
    elif has_docker_image "hadolint/hadolint"; then
      run_scan \
        "Hadolint (Dockerfile lint via Docker)" \
        "$REPORTS_DIR/hadolint_${TIMESTAMP}.txt" \
        "docker run --rm -i hadolint/hadolint < Dockerfile"
    else
      skip_scan "Hadolint" "hadolint nao instalado — rode: bash scripts/security-install.sh"
    fi

    # --- Trivy image scan (se a imagem existir) ---
    DOCKER_IMAGE="love-cosmetics:latest"
    if docker image inspect "$DOCKER_IMAGE" &>/dev/null 2>&1; then
      if has_tool trivy; then
        run_scan \
          "Trivy (Docker image: $DOCKER_IMAGE)" \
          "$REPORTS_DIR/trivy-image_${TIMESTAMP}.txt" \
          "trivy image --severity HIGH,CRITICAL $DOCKER_IMAGE"
      elif has_docker_image "ghcr.io/aquasecurity/trivy"; then
        run_scan \
          "Trivy (Docker image via Docker)" \
          "$REPORTS_DIR/trivy-image_${TIMESTAMP}.txt" \
          "MSYS_NO_PATHCONV=1 docker run --rm -v //var/run/docker.sock:/var/run/docker.sock ghcr.io/aquasecurity/trivy:latest image --severity HIGH,CRITICAL $DOCKER_IMAGE"
      fi
    else
      skip_scan "Trivy (Docker image)" "imagem '$DOCKER_IMAGE' nao encontrada localmente — faca build antes"
    fi
  else
    skip_scan "Docker scans" "Dockerfile nao encontrado"
  fi
fi

# =============================================================================
# 5. RESUMO DOS CUSTOM CHECKS
# =============================================================================
if [[ "$SCAN_MODE" == "all" ]]; then
  print_header "5/5 — VERIFICACOES CUSTOMIZADAS"

  CUSTOM_REPORT="$REPORTS_DIR/custom-checks_${TIMESTAMP}.txt"
  CUSTOM_ISSUES=0

  {
    echo "=== Verificacoes customizadas para Love Cosmetics ==="
    echo "Data: $(date)"
    echo ""

    # Check: Node.js EOL no Dockerfile
    echo "--- Check: Node.js version no Dockerfile ---"
    NODE_VERSION=$(grep -o 'FROM node:[0-9]*' Dockerfile | head -1 | sed 's/FROM node://')
    if [ -n "$NODE_VERSION" ] && [ "$NODE_VERSION" -lt 20 ]; then
      echo "ALERTA: Dockerfile usa Node $NODE_VERSION que esta em EOL. Migre para Node 20 ou 22."
      CUSTOM_ISSUES=$((CUSTOM_ISSUES + 1))
    else
      echo "OK: Node version $NODE_VERSION"
    fi
    echo ""

    # Check: .env copiado no Dockerfile
    echo "--- Check: .env no Dockerfile ---"
    if grep -q 'COPY.*\.env' Dockerfile; then
      echo "ALERTA: Dockerfile copia arquivo .env para dentro da imagem. Use runtime env vars ou Docker secrets."
      CUSTOM_ISSUES=$((CUSTOM_ISSUES + 1))
    else
      echo "OK: .env nao copiado no Dockerfile"
    fi
    echo ""

    # Check: libs JWT duplicadas
    echo "--- Check: libs JWT duplicadas ---"
    if grep -q '"jsonwebtoken"' package.json && grep -q '"jose"' package.json; then
      echo "AVISO: Projeto usa 'jsonwebtoken' E 'jose'. Considere unificar em 'jose' (mais moderno, sem deps nativas)."
      CUSTOM_ISSUES=$((CUSTOM_ISSUES + 1))
    else
      echo "OK: sem duplicacao de libs JWT"
    fi
    echo ""

    # Check: raw SQL queries no Prisma
    echo "--- Check: raw SQL queries (Prisma) ---"
    RAW_SQL=$(grep -r '\$queryRaw\|\$executeRaw\|\.raw(' src/ --include="*.ts" --include="*.tsx" -l 2>/dev/null || true)
    if [ -n "$RAW_SQL" ]; then
      echo "AVISO: Arquivos com raw SQL queries encontrados (verificar sanitizacao):"
      echo "$RAW_SQL"
      CUSTOM_ISSUES=$((CUSTOM_ISSUES + 1))
    else
      echo "OK: nenhuma raw SQL query encontrada"
    fi
    echo ""

    # Check: dangerouslySetInnerHTML
    echo "--- Check: dangerouslySetInnerHTML ---"
    DANGEROUS_HTML=$(grep -r 'dangerouslySetInnerHTML' src/ --include="*.tsx" --include="*.jsx" -l 2>/dev/null || true)
    if [ -n "$DANGEROUS_HTML" ]; then
      echo "AVISO: Uso de dangerouslySetInnerHTML encontrado (risco de XSS):"
      echo "$DANGEROUS_HTML"
      CUSTOM_ISSUES=$((CUSTOM_ISSUES + 1))
    else
      echo "OK: sem uso de dangerouslySetInnerHTML"
    fi
    echo ""

    # Check: headers de seguranca no next.config
    echo "--- Check: security headers no next.config ---"
    if [ -f "next.config.ts" ] || [ -f "next.config.js" ] || [ -f "next.config.mjs" ]; then
      CONFIG_FILE=$(ls next.config.* 2>/dev/null | head -1)
      if grep -q 'headers' "$CONFIG_FILE" 2>/dev/null; then
        echo "OK: next.config tem configuracao de headers"
      else
        echo "AVISO: next.config nao configura security headers (CSP, X-Frame-Options, etc.)"
        CUSTOM_ISSUES=$((CUSTOM_ISSUES + 1))
      fi
    fi
    echo ""

    echo "=== Total de issues customizadas: $CUSTOM_ISSUES ==="

  } > "$CUSTOM_REPORT" 2>&1

  TOTAL=$((TOTAL + 1))
  if [ "$CUSTOM_ISSUES" -eq 0 ]; then
    echo -e "${GREEN}  ✓ Verificacoes customizadas: OK${NC}"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}  ✗ Verificacoes customizadas: ${CUSTOM_ISSUES} issues encontradas${NC}"
    cat "$CUSTOM_REPORT" | sed 's/^/  /'
    FAILED=$((FAILED + 1))
  fi
fi

# =============================================================================
# RESUMO FINAL
# =============================================================================
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  RESUMO FINAL${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Total de scans:  $TOTAL"
echo -e "  ${GREEN}Passou:          $PASSED${NC}"
echo -e "  ${RED}Com problemas:   $FAILED${NC}"
echo -e "  ${YELLOW}Pulados:         $SKIPPED${NC}"
echo ""
echo -e "  Relatorios salvos em: ${BOLD}$REPORTS_DIR${NC}"
echo ""

if [ "$FAILED" -gt 0 ]; then
  echo -e "${RED}  ⚠  Vulnerabilidades encontradas! Revise os relatorios.${NC}"
  echo ""
  exit 1
else
  echo -e "${GREEN}  ✓  Nenhuma vulnerabilidade critica encontrada.${NC}"
  echo ""
  exit 0
fi

#!/bin/bash
# =============================================================================
# security-install.sh — Instala as ferramentas de segurança locais
# Executar UMA VEZ antes de rodar o security-scan.sh
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "=========================================="
echo "  Security Tools - Instalacao"
echo "=========================================="
echo ""

check_installed() {
  if command -v "$1" &>/dev/null; then
    echo -e "${GREEN}[OK]${NC} $1 ja instalado ($(command -v "$1"))"
    return 0
  else
    echo -e "${YELLOW}[--]${NC} $1 nao encontrado"
    return 1
  fi
}

MISSING=()

echo "--- Verificando ferramentas ---"
echo ""

check_installed "npm" || MISSING+=("npm")
check_installed "docker" || MISSING+=("docker")
check_installed "trivy" || MISSING+=("trivy")
check_installed "semgrep" || MISSING+=("semgrep")
check_installed "gitleaks" || MISSING+=("gitleaks")
check_installed "hadolint" || MISSING+=("hadolint")

echo ""

if [ ${#MISSING[@]} -eq 0 ]; then
  echo -e "${GREEN}Todas as ferramentas ja estao instaladas!${NC}"
  exit 0
fi

echo "=========================================="
echo "  Ferramentas faltando: ${MISSING[*]}"
echo "=========================================="
echo ""

# --- npm (pre-requisito) ---
if [[ " ${MISSING[*]} " =~ " npm " ]]; then
  echo -e "${RED}npm nao encontrado. Instale o Node.js primeiro: https://nodejs.org${NC}"
  exit 1
fi

# --- Trivy ---
if [[ " ${MISSING[*]} " =~ " trivy " ]]; then
  echo -e "${YELLOW}Instalando Trivy via Docker image (sem instalar binario)...${NC}"
  docker pull ghcr.io/aquasecurity/trivy:latest
  echo -e "${GREEN}[OK] Trivy disponivel via: docker run ghcr.io/aquasecurity/trivy${NC}"
  echo ""
  echo "    Alternativa: baixar binario em https://github.com/aquasecurity/trivy/releases"
  echo ""
fi

# --- Semgrep ---
if [[ " ${MISSING[*]} " =~ " semgrep " ]]; then
  echo -e "${YELLOW}Instalando Semgrep via pip...${NC}"
  if command -v pip &>/dev/null; then
    pip install semgrep
    echo -e "${GREEN}[OK] Semgrep instalado${NC}"
  else
    echo -e "${YELLOW}pip nao encontrado. Alternativa via Docker:${NC}"
    docker pull semgrep/semgrep:latest
    echo -e "${GREEN}[OK] Semgrep disponivel via: docker run semgrep/semgrep${NC}"
  fi
  echo ""
fi

# --- Gitleaks ---
if [[ " ${MISSING[*]} " =~ " gitleaks " ]]; then
  echo -e "${YELLOW}Instalando Gitleaks via Docker image...${NC}"
  docker pull ghcr.io/gitleaks/gitleaks:latest
  echo -e "${GREEN}[OK] Gitleaks disponivel via Docker${NC}"
  echo ""
  echo "    Alternativa: baixar binario em https://github.com/gitleaks/gitleaks/releases"
  echo ""
fi

# --- Hadolint ---
if [[ " ${MISSING[*]} " =~ " hadolint " ]]; then
  echo -e "${YELLOW}Instalando Hadolint via Docker image...${NC}"
  docker pull hadolint/hadolint:latest
  echo -e "${GREEN}[OK] Hadolint disponivel via Docker${NC}"
  echo ""
  echo "    Alternativa: baixar binario em https://github.com/hadolint/hadolint/releases"
  echo ""
fi

echo ""
echo "=========================================="
echo -e "  ${GREEN}Instalacao concluida!${NC}"
echo "  Agora rode: npm run security"
echo "=========================================="

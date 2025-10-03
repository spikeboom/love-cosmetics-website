const fs = require('fs');

// Lê o .env manualmente
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const STRAPI_URL = envVars.NEXT_PUBLIC_STRAPI_URL;
const STRAPI_TOKEN = envVars.STRAPI_API_TOKEN;
const BLING_BASE_URL = 'https://www.bling.com.br/Api/v3';

// Função para buscar token do Bling do banco
async function getBlingToken() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const token = await prisma.authToken.findFirst({
      where: {
        provider: 'bling',
        isActive: true,
        expiresAt: { gt: new Date() }
      }
    });

    await prisma.$disconnect();
    return token?.accessToken;
  } catch (error) {
    console.error('Erro ao buscar token:', error);
    return null;
  }
}

// Função para buscar todos os produtos do Bling
async function fetchBlingProducts(accessToken) {
  console.log('🔍 Buscando produtos do Bling...\n');

  let allProducts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${BLING_BASE_URL}/produtos?pagina=${page}&limite=100`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Erro na requisição: ${response.status}`);
        break;
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        allProducts = allProducts.concat(data.data);
        console.log(`   Página ${page}: ${data.data.length} produtos`);
        page++;

        // Verifica se há mais páginas
        hasMore = data.data.length === 100;
      } else {
        hasMore = false;
      }

    } catch (error) {
      console.error(`Erro ao buscar página ${page}:`, error.message);
      hasMore = false;
    }
  }

  console.log(`\n✅ Total de produtos no Bling: ${allProducts.length}\n`);
  return allProducts;
}

// Função para buscar produtos do Strapi
async function fetchStrapiProducts() {
  console.log('🔍 Buscando produtos do Strapi...\n');

  const url = `${STRAPI_URL}/api/produtos?pagination[limit]=1000`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`
    }
  });

  const data = await response.json();
  console.log(`✅ Total de produtos no Strapi: ${data.data?.length || 0}\n`);

  return data.data || [];
}

// Função para mapear produtos Bling -> Strapi
function mapProducts(blingProducts, strapiProducts) {
  console.log('🔗 Mapeando produtos Bling -> Strapi...\n');

  const matches = [];
  const unmatchedBling = [];
  const unmatchedStrapi = [];

  strapiProducts.forEach(strapiProd => {
    const strapiNome = strapiProd.nome?.toLowerCase().trim();

    // Tenta encontrar no Bling por nome similar
    const blingMatch = blingProducts.find(blingProd => {
      const blingNome = blingProd.nome?.toLowerCase().trim();
      const blingCodigo = blingProd.codigo?.toLowerCase().trim();

      // Match exato por nome
      if (blingNome === strapiNome) return true;

      // Match por similaridade (pelo menos 80% igual)
      if (blingNome && strapiNome) {
        const similarity = stringSimilarity(blingNome, strapiNome);
        return similarity > 0.8;
      }

      return false;
    });

    if (blingMatch) {
      matches.push({
        strapiId: strapiProd.id,
        strapiDocumentId: strapiProd.documentId,
        strapiNome: strapiProd.nome,
        blingId: blingMatch.id,
        blingCodigo: blingMatch.codigo,
        blingNome: blingMatch.nome,
        largura: blingMatch.largura,
        altura: blingMatch.altura,
        profundidade: blingMatch.profundidade,
        pesoLiquido: blingMatch.pesoLiquido,
        pesoBruto: blingMatch.pesoBruto
      });
    } else {
      unmatchedStrapi.push({
        id: strapiProd.id,
        nome: strapiProd.nome
      });
    }
  });

  console.log(`✅ Produtos mapeados: ${matches.length}`);
  console.log(`⚠️  Produtos não encontrados no Bling: ${unmatchedStrapi.length}`);

  return { matches, unmatchedStrapi };
}

// Função para calcular similaridade entre strings
function stringSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Função principal
async function main() {
  console.log('🚀 Iniciando sincronização Bling -> Strapi\n');
  console.log('=' .repeat(60) + '\n');

  // 1. Busca token do Bling
  const blingToken = await getBlingToken();
  if (!blingToken) {
    console.error('❌ Token do Bling não encontrado ou expirado');
    return;
  }
  console.log('✅ Token do Bling encontrado\n');

  // 2. Busca produtos do Bling
  const blingProducts = await fetchBlingProducts(blingToken);

  // 3. Busca produtos do Strapi
  const strapiProducts = await fetchStrapiProducts();

  // 4. Mapeia produtos
  const { matches, unmatchedStrapi } = mapProducts(blingProducts, strapiProducts);

  // 5. Mostra resultados
  console.log('\n' + '=' .repeat(60));
  console.log('📋 PRODUTOS MAPEADOS:\n');

  matches.slice(0, 10).forEach(match => {
    console.log(`\n🔗 Strapi ID ${match.strapiId}: ${match.strapiNome}`);
    console.log(`   → Bling ID ${match.blingId} (${match.blingCodigo}): ${match.blingNome}`);
    console.log(`   📦 Dimensões: ${match.largura || 'N/A'}cm × ${match.altura || 'N/A'}cm × ${match.profundidade || 'N/A'}cm`);
    console.log(`   ⚖️  Peso: ${match.pesoBruto || match.pesoLiquido || 'N/A'}g`);
  });

  if (matches.length > 10) {
    console.log(`\n... e mais ${matches.length - 10} produtos`);
  }

  // 6. Salva resultado em arquivo JSON
  const resultado = {
    timestamp: new Date().toISOString(),
    totalMatches: matches.length,
    totalUnmatched: unmatchedStrapi.length,
    matches,
    unmatchedStrapi
  };

  fs.writeFileSync('scripts/strapi/mapping-result.json', JSON.stringify(resultado, null, 2));
  console.log('\n\n💾 Resultado salvo em: scripts/strapi/mapping-result.json');

  console.log('\n' + '=' .repeat(60));
  console.log('✅ Sincronização concluída!\n');
}

main().catch(console.error);

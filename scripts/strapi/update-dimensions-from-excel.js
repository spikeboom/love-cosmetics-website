const fs = require('fs');
const XLSX = require('xlsx');

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

// Lê a planilha
const workbook = XLSX.readFile('scripts/strapi/planilha-produtos.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const excelData = XLSX.utils.sheet_to_json(worksheet);

// Mapeia nomes da planilha para nomes do Strapi
const PRODUCT_NAME_MAPPING = {
  'ESPUMA FACIAL DE LIMPEZA': 'Espuma Facial',
  'SÉRUM FACIAL': 'Sérum Facial',
  'SÉRUM FACIAL ': 'Sérum Facial',
  'HIDRATANTE FACIAL': 'Hidratante Facial',
  'HIDRATANTE FACIAL ': 'Hidratante Facial',
  'MÁSCARA DE ARGILA': 'Máscara de Argila',
  'MANTEIGA CORPORAL': 'Manteiga Corporal'
};

// Função para extrair número de string (ex: "178,0g" -> 178)
function extractNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(',', '.').replace(/[^\d.]/g, ''));
    return isNaN(num) ? null : num;
  }
  return null;
}

// Função para buscar produtos do Strapi
async function fetchStrapiProducts() {
  const url = `${STRAPI_URL}/api/produtos?pagination[limit]=1000`;
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
  });
  const data = await response.json();
  return data.data || [];
}

// Função para atualizar produto no Strapi
async function updateStrapiProduct(documentId, dimensions) {
  const url = `${STRAPI_URL}/api/produtos/${documentId}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: dimensions })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Função principal
async function main() {
  console.log('🚀 Atualizando dimensões do Excel para Strapi\n');
  console.log('=' .repeat(60) + '\n');

  // 1. Busca produtos do Strapi
  const strapiProducts = await fetchStrapiProducts();
  console.log(`📦 ${strapiProducts.length} produtos no Strapi\n`);

  // 2. Processa dados da planilha (pula as 2 primeiras linhas - cabeçalhos)
  const produtosExcel = excelData.slice(2).map(row => ({
    nome: row.__EMPTY_2?.trim(),
    peso_gramas: extractNumber(row.__EMPTY_5),
    comprimento: extractNumber(row.__EMPTY_7) / 10, // mm -> cm
    largura: extractNumber(row.__EMPTY_8) / 10, // mm -> cm
    altura: extractNumber(row.__EMPTY_9) / 10, // mm -> cm
    ean: row.__EMPTY_10,
    ncm: row.__EMPTY_12
  })).filter(p => p.nome);

  console.log(`📋 ${produtosExcel.length} produtos na planilha\n`);

  // 3. Mapeia e atualiza
  let sucessos = 0;
  let erros = 0;
  const naoEncontrados = [];

  for (const excelProd of produtosExcel) {
    // Normaliza nome para buscar mapeamento
    const nomeNormalizado = PRODUCT_NAME_MAPPING[excelProd.nome.toUpperCase()] || excelProd.nome;

    // Busca produto no Strapi
    const strapiProd = strapiProducts.find(p =>
      p.nome?.toLowerCase().trim() === nomeNormalizado.toLowerCase().trim()
    );

    if (!strapiProd) {
      console.log(`⚠️  Produto não encontrado no Strapi: ${excelProd.nome}`);
      naoEncontrados.push(excelProd.nome);
      continue;
    }

    try {
      console.log(`\n🔄 Atualizando: ${strapiProd.nome}`);
      console.log(`   Strapi ID: ${strapiProd.id} (documentId: ${strapiProd.documentId})`);
      console.log(`   Dimensões: ${excelProd.comprimento}cm × ${excelProd.largura}cm × ${excelProd.altura}cm`);
      console.log(`   Peso: ${excelProd.peso_gramas}g`);

      const dimensions = {
        largura: excelProd.largura,
        altura: excelProd.altura,
        comprimento: excelProd.comprimento,
        peso_gramas: excelProd.peso_gramas
      };

      await updateStrapiProduct(strapiProd.documentId, dimensions);

      console.log(`   ✅ Atualizado com sucesso`);
      sucessos++;

      // Aguarda 500ms entre requisições
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
      erros++;
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log(`\n✅ Atualização concluída!`);
  console.log(`   Sucessos: ${sucessos}`);
  console.log(`   Erros: ${erros}`);
  console.log(`   Não encontrados: ${naoEncontrados.length}`);

  if (naoEncontrados.length > 0) {
    console.log(`\n   Produtos não encontrados:`, naoEncontrados.join(', '));
  }
  console.log('');
}

main().catch(console.error);

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

// Lê o resultado do mapeamento
const mappingResult = JSON.parse(
  fs.readFileSync('scripts/strapi/mapping-result.json', 'utf8')
);

// Função para atualizar produto no Strapi
async function updateStrapiProduct(documentId, blingId) {
  const url = `${STRAPI_URL}/api/produtos/${documentId}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          bling_number: blingId
        }
      })
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
  console.log('🚀 Atualizando bling_number no Strapi\n');
  console.log('=' .repeat(60) + '\n');

  const { matches } = mappingResult;

  console.log(`📦 ${matches.length} produtos para atualizar\n`);

  let sucessos = 0;
  let erros = 0;

  for (const match of matches) {
    try {
      console.log(`\n🔄 Atualizando: ${match.strapiNome}`);
      console.log(`   Strapi ID: ${match.strapiId} (documentId: ${match.strapiDocumentId})`);
      console.log(`   Bling ID: ${match.blingId}`);

      await updateStrapiProduct(match.strapiDocumentId, match.blingId);

      console.log(`   ✅ Atualizado com sucesso`);
      sucessos++;

      // Aguarda 500ms entre requisições para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
      erros++;
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log(`\n✅ Atualização concluída!`);
  console.log(`   Sucessos: ${sucessos}`);
  console.log(`   Erros: ${erros}\n`);
}

main().catch(console.error);

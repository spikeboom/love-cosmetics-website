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

const url = 'https://strapi.lovecosmeticos.xyz/api/produtos?pagination[limit]=50';
const token = envVars.STRAPI_API_TOKEN;

console.log('Buscando produtos com dimensões e código Bling...\n');

fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => {
  if (data.data) {
    console.log('=== PRODUTOS COM DIMENSÕES E CÓDIGO BLING ===\n');

    data.data.forEach(produto => {
      const id = produto.id;
      const nome = produto.nome || 'Sem nome';
      const slug = produto.slug || 'N/A';

      // Mostra todos os campos para debug
      console.log(`\n📦 ID Strapi: ${id}`);
      console.log(`   Nome: ${nome}`);
      console.log(`   Slug: ${slug}`);
      console.log(`   Largura: ${produto.largura || 'N/A'} cm`);
      console.log(`   Altura: ${produto.altura || 'N/A'} cm`);
      console.log(`   Comprimento: ${produto.comprimento || 'N/A'} cm`);
      console.log(`   Peso: ${produto.peso_gramas || 'N/A'} gramas`);
      console.log(`   Código Bling: ${produto.bling_number || 'N/A'}`);
    });

    // Mostra todos os campos do primeiro produto para análise
    console.log('\n\n=== CAMPOS DISPONÍVEIS NO PRIMEIRO PRODUTO ===\n');
    if (data.data[0]) {
      const campos = Object.keys(data.data[0]);
      console.log(campos.join(', '));

      // Mostra campos que podem ser dimensões
      console.log('\n=== CAMPOS QUE PODEM SER DIMENSÕES/BLING ===\n');
      const possiveisCampos = campos.filter(c =>
        c.toLowerCase().includes('dimensao') ||
        c.toLowerCase().includes('largura') ||
        c.toLowerCase().includes('altura') ||
        c.toLowerCase().includes('profundidade') ||
        c.toLowerCase().includes('comprimento') ||
        c.toLowerCase().includes('width') ||
        c.toLowerCase().includes('height') ||
        c.toLowerCase().includes('depth') ||
        c.toLowerCase().includes('length') ||
        c.toLowerCase().includes('bling') ||
        c.toLowerCase().includes('codigo')
      );

      if (possiveisCampos.length > 0) {
        console.log(possiveisCampos.join(', '));
      } else {
        console.log('Nenhum campo suspeito encontrado');
      }
    }

  } else {
    console.log('Erro:', data.error);
  }
})
.catch(err => console.error('Erro na requisição:', err.message));

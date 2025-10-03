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

const url = 'https://strapi.lovecosmeticos.xyz/api/produtos?pagination[limit]=10';
const token = envVars.STRAPI_API_TOKEN;

console.log('Token existe?', !!token);
console.log('Token length:', token?.length);

fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('\n=== RESPOSTA COMPLETA ===\n');
  console.log(JSON.stringify(data, null, 2));
})
.catch(err => console.error('Erro na requisição:', err.message));

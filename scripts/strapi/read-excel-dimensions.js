const fs = require('fs');
const XLSX = require('xlsx');

// Caminho do arquivo Excel
const excelPath = 'scripts/strapi/planilha-produtos.xlsx';

console.log('📊 Lendo planilha Excel...\n');
console.log('Arquivo:', excelPath);

try {
  // Verifica se o arquivo existe
  if (!fs.existsSync(excelPath)) {
    console.error('❌ Arquivo não encontrado!');
    process.exit(1);
  }

  // Lê o arquivo Excel
  const workbook = XLSX.readFile(excelPath);

  console.log('\n✅ Planilha carregada com sucesso!');
  console.log('\n📋 Abas disponíveis:', workbook.SheetNames.join(', '));

  // Lê a primeira aba
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Converte para JSON
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`\n📦 Total de linhas: ${data.length}`);

  // Mostra primeiras 5 linhas para entender a estrutura
  console.log('\n=== PRIMEIRAS 5 LINHAS ===\n');
  data.slice(0, 5).forEach((row, index) => {
    console.log(`\nLinha ${index + 1}:`);
    console.log(JSON.stringify(row, null, 2));
  });

  // Identifica colunas disponíveis
  if (data.length > 0) {
    console.log('\n=== COLUNAS DISPONÍVEIS ===\n');
    const colunas = Object.keys(data[0]);
    colunas.forEach((col, i) => {
      console.log(`${i + 1}. ${col}`);
    });
  }

  // Salva dados em JSON para análise
  fs.writeFileSync(
    'scripts/strapi/excel-data.json',
    JSON.stringify(data, null, 2)
  );
  console.log('\n💾 Dados salvos em: scripts/strapi/excel-data.json');

} catch (error) {
  console.error('\n❌ Erro ao ler planilha:', error.message);
  console.error(error.stack);
}

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const ids = [
  '4d92e21c-3493-4d1e-be4c-b530a1af9c04',
  '8b50b5c3-6040-4437-acd0-773b8937f2fe',
  'affd7603-cffd-4f84-a69f-e24624fc6025',
  '29319f9a-8128-4598-a38b-571c84caac02',
  '66e1c773-eecf-4a4c-af32-43a5094182b8',
  '62b8d477-f11f-47be-af54-8e246d735d62',
  'c4079c5c-4031-4227-848d-c9697869b04d',
];

async function show() {
  console.log('Pedidos a serem corrigidos:\n');
  console.log('='.repeat(60));

  for (const id of ids) {
    const p = await prisma.pedido.findUnique({ where: { id } });
    if (!p) continue;
    const items = p.items as any[];

    console.log(`\nPedido: #${id.slice(-8)} - ${p.nome}`);
    console.log(`Data: ${p.createdAt.toISOString().slice(0,10)}`);
    console.log('-'.repeat(40));

    items.forEach(i => {
      console.log(`  Produto: ${i.name}`);
      console.log(`    preco (valor real):     R$ ${i.preco.toFixed(2)}`);
      console.log(`    unit_amount (errado):   ${i.unit_amount}`);
      console.log(`    unit_amount (correto):  ${i.preco}`);
      console.log('');
    });
  }

  console.log('='.repeat(60));
  console.log('\nResumo: unit_amount será alterado de centavos para reais');
}

show()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

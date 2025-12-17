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

async function fix() {
  console.log('Corrigindo unit_amount dos pedidos...\n');

  for (const id of ids) {
    const p = await prisma.pedido.findUnique({ where: { id } });
    if (!p) {
      console.log(`✗ Pedido ${id.slice(-8)} não encontrado`);
      continue;
    }

    const items = p.items as any[];
    const itemsCorrigidos = items.map(item => ({
      ...item,
      unit_amount: item.preco,
    }));

    await prisma.pedido.update({
      where: { id },
      data: { items: itemsCorrigidos },
    });

    console.log(`✓ Pedido #${id.slice(-8)} (${p.nome}) corrigido`);
    items.forEach(i => {
      console.log(`  - ${i.name}: ${i.unit_amount} → ${i.preco}`);
    });
  }

  console.log('\nConcluído!');
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

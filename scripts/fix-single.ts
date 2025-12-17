import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  const id = 'dc45c4fb-d4f4-49c6-9118-8dd76bf7cfa0';
  const p = await prisma.pedido.findUnique({ where: { id } });
  if (!p) {
    console.log('Pedido não encontrado');
    return;
  }
  const items = p.items as any[];
  const itemsCorrigidos = items.map(item => ({ ...item, unit_amount: item.preco }));
  await prisma.pedido.update({ where: { id }, data: { items: itemsCorrigidos } });
  console.log(`✓ Pedido #${id.slice(-8)} (${p.nome}) corrigido:`);
  items.forEach(i => console.log(`  - ${i.name}: ${i.unit_amount} → ${i.preco}`));
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listOrders() {
  const pedidos = await prisma.pedido.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: { id: true, nome: true, createdAt: true, items: true }
  });

  console.log('Pedidos mais recentes:\n');
  pedidos.forEach(p => {
    const items = p.items as any[];
    const itemInfo = items?.length > 0 ? items.map(i => `${i.name}: preco=${i.preco}, unit_amount=${i.unit_amount}`).join(', ') : 'sem items';
    console.log(`${p.id} - ${p.nome} - ${p.createdAt.toISOString().slice(0, 10)}`);
    console.log(`  Items: ${itemInfo}\n`);
  });
}

listOrders()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

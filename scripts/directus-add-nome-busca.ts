/**
 * Script: adiciona campo nome_busca na coleção produtos do Directus
 * e popula todos os registros existentes com o nome normalizado (sem acentos, minúsculas).
 *
 * Uso:
 *   npx tsx scripts/directus-add-nome-busca.ts
 *
 * Requer variáveis de ambiente:
 *   DIRECTUS_INTERNAL_URL (ou NEXT_PUBLIC_DIRECTUS_URL)
 *   DIRECTUS_API_TOKEN
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const BASE_URL =
  process.env.DIRECTUS_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_DIRECTUS_URL ||
  "http://localhost:8055";
const TOKEN = process.env.DIRECTUS_API_TOKEN;

if (!TOKEN) {
  console.error("DIRECTUS_API_TOKEN não definido");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${TOKEN}`,
};

function removeAcentos(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

async function criarCampo() {
  const res = await fetch(`${BASE_URL}/fields/produtos`, {
    method: "GET",
    headers,
  });
  if (!res.ok) throw new Error(`Erro ao listar campos: ${res.status}`);
  const { data } = await res.json();
  const existe = (data as any[]).some((f: any) => f.field === "nome_busca");

  if (existe) {
    console.log("Campo nome_busca já existe, pulando criação.");
    return;
  }

  const criar = await fetch(`${BASE_URL}/fields/produtos`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      field: "nome_busca",
      type: "string",
      meta: {
        interface: "input",
        display: "raw",
        readonly: true,
        hidden: false,
        note: "Nome sem acentos para busca (auto-gerado, não editar manualmente)",
      },
      schema: {
        name: "nome_busca",
        table: "produtos",
        data_type: "varchar",
        max_length: 500,
        is_nullable: true,
      },
    }),
  });

  if (!criar.ok) {
    const body = await criar.text();
    throw new Error(`Erro ao criar campo: ${criar.status} ${body}`);
  }
  console.log("Campo nome_busca criado com sucesso.");
}

async function popularProdutos() {
  let page = 1;
  const limit = 100;
  let totalAtualizados = 0;

  while (true) {
    const res = await fetch(
      `${BASE_URL}/items/produtos?fields=id,nome&limit=${limit}&page=${page}&filter[status][_eq]=published`,
      { headers }
    );
    if (!res.ok) throw new Error(`Erro ao listar produtos: ${res.status}`);
    const { data } = await res.json();
    if (!data || data.length === 0) break;

    for (const produto of data as { id: string | number; nome: string }[]) {
      const nomeBusca = removeAcentos(produto.nome || "");
      const patch = await fetch(`${BASE_URL}/items/produtos/${produto.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ nome_busca: nomeBusca }),
      });
      if (!patch.ok) {
        const body = await patch.text();
        console.error(`Erro ao atualizar produto ${produto.id}: ${body}`);
      } else {
        totalAtualizados++;
        console.log(`  [${produto.id}] "${produto.nome}" → "${nomeBusca}"`);
      }
    }

    if (data.length < limit) break;
    page++;
  }

  console.log(`\nTotal atualizado: ${totalAtualizados} produtos.`);
}

async function main() {
  console.log(`Conectando em ${BASE_URL}...\n`);
  await criarCampo();
  console.log("\nPopulando nome_busca em todos os produtos...");
  await popularProdutos();
  console.log("\nConcluído.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

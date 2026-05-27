import argon2 from "argon2";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ENV_PATH = path.join(ROOT, ".env");
const COLLECTION = "app_config";

function loadDotEnv() {
  if (!fs.existsSync(ENV_PATH)) return;

  const lines = fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const eq = trimmed.indexOf("=");
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    const commentIndex = value.indexOf(" #");
    if (commentIndex >= 0) value = value.slice(0, commentIndex).trim();
    value = value.replace(/^["']|["']$/g, "");

    if (!(key in process.env)) process.env[key] = value;
  }
}

function getDirectusBaseUrl() {
  return (
    process.env.DIRECTUS_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_DIRECTUS_URL ||
    "http://localhost:8055"
  );
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    ...(process.env.DIRECTUS_API_TOKEN
      ? { Authorization: `Bearer ${process.env.DIRECTUS_API_TOKEN}` }
      : {}),
  };
}

async function setConfigValue(key, value, note) {
  const baseUrl = getDirectusBaseUrl();
  const lookup = await fetch(
    `${baseUrl}/items/${COLLECTION}?filter[key][_eq]=${encodeURIComponent(key)}&fields=id&limit=1`,
    { headers: getHeaders(), cache: "no-store" }
  );

  if (!lookup.ok) {
    throw new Error(`Lookup ${key} falhou: ${lookup.status} ${await lookup.text()}`);
  }

  const lookupJson = await lookup.json();
  const row = Array.isArray(lookupJson?.data) ? lookupJson.data[0] : null;
  const body = JSON.stringify({ value, note });

  if (row?.id) {
    const update = await fetch(`${baseUrl}/items/${COLLECTION}/${row.id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body,
    });
    if (!update.ok) {
      throw new Error(`Update ${key} falhou: ${update.status} ${await update.text()}`);
    }
    return;
  }

  const create = await fetch(`${baseUrl}/items/${COLLECTION}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ key, value, note }),
  });
  if (!create.ok) {
    throw new Error(`Create ${key} falhou: ${create.status} ${await create.text()}`);
  }
}

loadDotEnv();

const username = process.env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD;

if (!password) {
  throw new Error("ADMIN_PASSWORD nao encontrada no ambiente ou .env");
}

const passwordHash = await argon2.hash(password);

await setConfigValue("admin_username", username, "Usuario da tela /pedidos/login");
await setConfigValue("admin_password_hash", passwordHash, "Hash Argon2 da senha da tela /pedidos/login");

console.log("Credenciais admin gravadas no Directus app_config:");
console.log(`- admin_username=${username}`);
console.log("- admin_password_hash=<argon2>");

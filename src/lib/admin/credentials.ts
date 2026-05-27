import { getConfigValues } from "@/lib/cms/directus/app-config";

const DIRECTUS_ADMIN_KEYS = {
  username: "admin_username",
  passwordHash: "admin_password_hash",
  passwordPlain: "admin_password",
} as const;

export interface AdminCredentials {
  username: string;
  passwordHash: string | null;
  passwordPlain: string | null;
}

function hasDirectusConfig() {
  return Boolean(
    process.env.DIRECTUS_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_DIRECTUS_URL ||
      process.env.DIRECTUS_API_TOKEN
  );
}

function getEnvCredentials(): AdminCredentials {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    passwordHash: process.env.ADMIN_PASSWORD_HASH || null,
    passwordPlain: process.env.ADMIN_PASSWORD || null,
  };
}

export async function getAdminCredentials(): Promise<AdminCredentials> {
  const envCredentials = getEnvCredentials();

  if (!hasDirectusConfig()) return envCredentials;

  try {
    const directusCredentials = await getConfigValues([
      DIRECTUS_ADMIN_KEYS.username,
      DIRECTUS_ADMIN_KEYS.passwordHash,
      DIRECTUS_ADMIN_KEYS.passwordPlain,
    ]);

    return {
      username: directusCredentials[DIRECTUS_ADMIN_KEYS.username] || envCredentials.username,
      passwordHash:
        directusCredentials[DIRECTUS_ADMIN_KEYS.passwordHash] ||
        envCredentials.passwordHash,
      passwordPlain:
        directusCredentials[DIRECTUS_ADMIN_KEYS.passwordPlain] ||
        envCredentials.passwordPlain,
    };
  } catch (error) {
    console.warn("[admin-auth] Directus app_config indisponivel, usando fallback env:", error);
    return envCredentials;
  }
}

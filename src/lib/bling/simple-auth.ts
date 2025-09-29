import { createLogger } from "@/utils/logMessage";

const logMessage = createLogger();

// Configurações OAuth2 do Bling
const BLING_CLIENT_ID = "0fc9335fe026c928d97d7571eca24580ebe72aae";
const BLING_CLIENT_SECRET = "2de51d4c3ac3aff33272c6c4843aaf0027655f6b15ef904bf3b42de65469";
const BLING_TOKEN_URL = "https://api.bling.com.br/Api/v3/oauth/token";

// Armazenar token em memória (simples) - temporário para desenvolvimento
let currentAccessToken: string | null = null;

// Para desenvolvimento - salvar em env temporário
function saveTokenToEnv(token: string) {
  process.env.BLING_TEMP_TOKEN = token;
  currentAccessToken = token;
}

function getTokenFromEnv(): string | null {
  return process.env.BLING_TEMP_TOKEN || currentAccessToken;
}

// Troca o code por access_token
export async function exchangeCodeForToken(code: string): Promise<string> {
  try {
    // Cria o header de autenticação Basic
    const credentials = `${BLING_CLIENT_ID}:${BLING_CLIENT_SECRET}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');

    const requestBody = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: "http://localhost:3000/api/bling/callback",
    });

    logMessage("Dados da requisição OAuth", {
      url: BLING_TOKEN_URL,
      client_id: BLING_CLIENT_ID,
      encoded_credentials: encodedCredentials,
      redirect_uri: "http://localhost:3000/api/bling/callback",
      body: requestBody.toString(),
    });

    const response = await fetch(BLING_TOKEN_URL, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${encodedCredentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorData = await response.text();
      logMessage("Erro ao trocar code por token", {
        status: response.status,
        error: errorData
      });
      throw new Error(`Erro ao obter token: ${response.status}`);
    }

    const tokenData = await response.json();
    saveTokenToEnv(tokenData.access_token);

    logMessage("Token obtido com sucesso", {
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type
    });

    return tokenData.access_token;
  } catch (error) {
    logMessage("Erro na troca de token", error);
    throw error;
  }
}

// Obter token atual (simples)
export function getCurrentToken(): string | null {
  const token = getTokenFromEnv();
  console.log("Token atual:", token);
  return token;
}
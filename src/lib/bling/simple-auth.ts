import { createLogger } from "@/utils/logMessage";
import { prisma } from "@/lib/prisma";

const logMessage = createLogger();

// Configurações OAuth2 do Bling
const BLING_CLIENT_ID = "0fc9335fe026c928d97d7571eca24580ebe72aae";
const BLING_CLIENT_SECRET = "2de51d4c3ac3aff33272c6c4843aaf0027655f6b15ef904bf3b42de65469";
const BLING_TOKEN_URL = "https://api.bling.com.br/Api/v3/oauth/token";

// Provider constante para o Bling
const BLING_PROVIDER = "bling";

// Salvar tokens no banco de dados (upsert)
async function saveTokensToDatabase(accessToken: string, refreshToken: string, expiresIn: number): Promise<void> {
  try {
    const now = new Date();
    const expiresAt = new Date(Date.now() + (expiresIn * 1000));
    const refreshExpiresAt = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); // 30 dias

    // Buscar token existente
    const existingToken = await prisma.authToken.findFirst({
      where: { provider: BLING_PROVIDER }
    });

    if (existingToken) {
      // Atualizar token existente
      await prisma.authToken.update({
        where: { id: existingToken.id },
        data: {
          accessToken,
          refreshToken,
          tokenType: "Bearer",
          expiresAt,
          refreshExpiresAt,
          clientId: BLING_CLIENT_ID,
          isActive: true
        }
      });

      logMessage("Token atualizado no banco com sucesso", {
        provider: BLING_PROVIDER,
        tokenId: existingToken.id,
        expiresAt: expiresAt.toISOString(),
        refreshExpiresAt: refreshExpiresAt.toISOString()
      });
    } else {
      // Criar novo token
      await prisma.authToken.create({
        data: {
          provider: BLING_PROVIDER,
          accessToken,
          refreshToken,
          tokenType: "Bearer",
          expiresAt,
          refreshExpiresAt,
          clientId: BLING_CLIENT_ID,
          isActive: true
        }
      });

      logMessage("Token criado no banco com sucesso", {
        provider: BLING_PROVIDER,
        expiresAt: expiresAt.toISOString(),
        refreshExpiresAt: refreshExpiresAt.toISOString()
      });
    }
  } catch (error) {
    logMessage("Erro ao salvar tokens no banco", error);
    throw error;
  }
}

// Buscar token ativo do banco (ou reativar se tiver refresh válido)
async function getActiveToken(): Promise<{ accessToken: string; refreshToken: string | null; expiresAt: Date } | null> {
  try {
    // Primeiro tentar buscar token ativo
    let token = await prisma.authToken.findFirst({
      where: {
        provider: BLING_PROVIDER,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Se não encontrou token ativo, verificar se há token inativo com refresh válido
    if (!token) {
      const now = new Date();
      const inactiveTokenWithValidRefresh = await prisma.authToken.findFirst({
        where: {
          provider: BLING_PROVIDER,
          isActive: false,
          refreshExpiresAt: {
            gt: now // refresh token ainda não expirou
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (inactiveTokenWithValidRefresh) {
        logMessage("Token inativo encontrado com refresh válido, reativando automaticamente", {
          tokenId: inactiveTokenWithValidRefresh.id,
          refreshExpiresAt: inactiveTokenWithValidRefresh.refreshExpiresAt
        });

        // Reativar o token
        token = await prisma.authToken.update({
          where: { id: inactiveTokenWithValidRefresh.id },
          data: { isActive: true }
        });
      }
    }

    if (!token) {
      return null;
    }

    return {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      expiresAt: token.expiresAt
    };
  } catch (error) {
    logMessage("Erro ao buscar token do banco", error);
    return null;
  }
}

// Verificar se token está expirado
function isTokenExpired(expiresAt: Date): boolean {
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
  return expiresAt <= fiveMinutesFromNow;
}

// Atualizar último uso do token
async function updateLastUsed(): Promise<void> {
  try {
    await prisma.authToken.updateMany({
      where: {
        provider: BLING_PROVIDER,
        isActive: true
      },
      data: {
        lastUsedAt: new Date()
      }
    });
  } catch (error) {
    logMessage("Erro ao atualizar last used", error);
  }
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

    const tokenResponse = await response.json();
    await saveTokensToDatabase(tokenResponse.access_token, tokenResponse.refresh_token, tokenResponse.expires_in);

    logMessage("Token obtido com sucesso", {
      expires_in: tokenResponse.expires_in,
      token_type: tokenResponse.token_type,
      has_refresh_token: !!tokenResponse.refresh_token
    });

    return tokenResponse.access_token;
  } catch (error) {
    logMessage("Erro na troca de token", error);
    throw error;
  }
}

// Renovar access token usando refresh token
export async function refreshAccessToken(): Promise<string> {
  try {
    const tokenData = await getActiveToken();

    if (!tokenData || !tokenData.refreshToken) {
      const errorMsg = !tokenData ? "Token não encontrado no banco" : "Refresh token é null";
      logMessage("Não foi possível renovar token", {
        reason: errorMsg,
        hasTokenData: !!tokenData,
        hasRefreshToken: !!tokenData?.refreshToken
      });
      throw new Error(`Refresh token não encontrado: ${errorMsg}`);
    }

    const refreshToken = tokenData.refreshToken;

    const credentials = `${BLING_CLIENT_ID}:${BLING_CLIENT_SECRET}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');

    const requestBody = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    logMessage("Renovando access token", {
      url: BLING_TOKEN_URL,
      refresh_token_length: refreshToken.length,
      grant_type: "refresh_token"
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
      logMessage("Erro ao renovar token - API Bling retornou erro", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        possibleCauses: "Refresh token pode ter expirado ou sido revogado"
      });
      throw new Error(`Erro ao renovar token: ${response.status} - ${errorData}`);
    }

    const refreshResponse = await response.json();
    await saveTokensToDatabase(refreshResponse.access_token, refreshResponse.refresh_token || refreshToken, refreshResponse.expires_in);

    logMessage("Token renovado com sucesso via refresh token", {
      expires_in: refreshResponse.expires_in,
      token_type: refreshResponse.token_type,
      new_refresh_token_received: !!refreshResponse.refresh_token
    });

    return refreshResponse.access_token;
  } catch (error) {
    logMessage("Erro crítico na renovação de token", {
      error,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

// Obter token atual com renovação automática
export async function getCurrentToken(): Promise<string | null> {
  try {
    const tokenData = await getActiveToken();

    if (!tokenData) {
      logMessage("Token não encontrado no banco", { tokenData: null });
      return null;
    }

    if (isTokenExpired(tokenData.expiresAt)) {
      logMessage("Token expirado, renovando automaticamente", {
        expiresAt: tokenData.expiresAt,
        hasRefreshToken: !!tokenData.refreshToken
      });

      try {
        const newToken = await refreshAccessToken();
        return newToken;
      } catch (refreshError) {
        logMessage("Erro ao renovar token automaticamente", {
          error: refreshError,
          message: "Sistema não conseguiu renovar o token. Verifique se o refresh token ainda é válido."
        });
        return null;
      }
    }

    // Atualizar último uso
    try {
      await updateLastUsed();
    } catch (error) {
      logMessage("Erro ao atualizar lastUsedAt, continuando com token", error);
    }

    return tokenData.accessToken;
  } catch (error) {
    logMessage("Erro ao obter token atual", error);
    return null;
  }
}

// Função para fazer requisições autenticadas com renovação automática
export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    const token = await getCurrentToken();

    if (!token) {
      throw new Error("Token não disponível");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Authorization": `Bearer ${token}`,
      },
    });

    // Se a resposta indica token inválido, tenta renovar uma vez
    if (response.status === 401) {
      logMessage("Token inválido, tentando renovar", { status: response.status });

      const newToken = await refreshAccessToken();

      return await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          "Authorization": `Bearer ${newToken}`,
        },
      });
    }

    return response;
  } catch (error) {
    logMessage("Erro na requisição autenticada", error);
    throw error;
  }
}

// Função para obter informações detalhadas dos tokens (para debug)
export async function getTokenInfo() {
  const now = new Date();
  const tokenData = await getActiveToken();

  return {
    timestamp: now.getTime(),
    currentTime: now.toISOString(),
    database: {
      hasActiveToken: !!tokenData,
      accessToken: {
        value: tokenData?.accessToken ? `${tokenData.accessToken.substring(0, 20)}...` : null,
        exists: !!tokenData?.accessToken,
        length: tokenData?.accessToken?.length || 0
      },
      refreshToken: {
        value: tokenData?.refreshToken ? `${tokenData.refreshToken.substring(0, 20)}...` : null,
        exists: !!tokenData?.refreshToken,
        length: tokenData?.refreshToken?.length || 0
      },
      expiration: {
        expiresAt: tokenData?.expiresAt?.toISOString() || null,
        timeUntilExpiration: tokenData?.expiresAt ? Math.max(0, tokenData.expiresAt.getTime() - now.getTime()) : null,
        timeUntilExpirationMinutes: tokenData?.expiresAt ? Math.max(0, Math.floor((tokenData.expiresAt.getTime() - now.getTime()) / 60000)) : null,
        isExpired: tokenData?.expiresAt ? isTokenExpired(tokenData.expiresAt) : true,
        willExpireSoon: tokenData?.expiresAt ? isTokenExpired(tokenData.expiresAt) : true
      }
    },
    provider: BLING_PROVIDER,
    clientId: BLING_CLIENT_ID
  };
}
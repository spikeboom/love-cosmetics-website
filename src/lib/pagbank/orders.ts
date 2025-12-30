type LogMessage = (message: string, data?: unknown) => void;

export async function fetchPagBankOrder({
  pagBankUrl,
  token,
  orderId,
  logMessage,
}: {
  pagBankUrl: string;
  token: string;
  orderId: string;
  logMessage: LogMessage;
}): Promise<{ ok: boolean; status: number; data: any }> {
  const response = await fetch(`${pagBankUrl}/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    logMessage("Erro ao consultar pedido no PagBank", data);
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

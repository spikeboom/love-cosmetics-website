"use server";

import { PedidoFormData } from "@/app/checkout/page";
import { getBaseURL } from "@/utils/getBaseUrl";

export async function postPedido(data: PedidoFormData) {
  console.log({ getBaseURL2: getBaseURL() });
  const response = await fetch(`${getBaseURL()}/api/pedido`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      data_nascimento: new Date(data.data_nascimento)
        .toISOString()
        .split("T")[0],
    }),
  });

  if (!response.ok) {
    throw new Error("Erro ao enviar o pedido");
  }

  return await response.json();
}

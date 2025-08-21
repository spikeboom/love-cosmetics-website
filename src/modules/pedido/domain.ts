"use server";

import { PedidoFormData } from "@/app/(global)/checkout/PedidoForm";
import { getBaseURL } from "@/utils/getBaseUrl";
import { cookies } from "next/headers";

export async function postPedido(data: PedidoFormData) {
  console.log({ getBaseURL2: getBaseURL() });
  console.log(
    JSON.stringify(
      { message: "Fetch para pedido", url: `${getBaseURL()}/api/pedido`, data },
      null,
      0,
    ),
  );

  // Obter cookies para passar na requisição
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  

  const response = await fetch(`${getBaseURL()}/api/pedido`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookieHeader,
    },
    body: JSON.stringify({
      ...data,
      data_nascimento: new Date(data.data_nascimento).toISOString(),
    }),
  });

  // Obtém o conteúdo JSON da resposta
  const json = await response.json();

  console.log(JSON.stringify({ message: "Resposta de pedido", json }, null, 0));

  // Em vez de lançar um erro genérico, retorne o JSON,
  // permitindo que o frontend trate os detalhes do erro
  if (!response.ok) {
    return json;
  }

  return json;
}

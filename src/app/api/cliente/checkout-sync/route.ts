import { NextRequest, NextResponse } from "next/server";
import { verificarAutenticacao } from "@/lib/cliente/auth";
import { updateCliente } from "@/lib/cliente/session";

interface CheckoutSyncBody {
  identificacao?: {
    nome: string;
    telefone: string;
    dataNascimento: string;
  };
  entrega?: {
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
}

export async function PUT(request: NextRequest) {
  try {
    const cliente = await verificarAutenticacao(request);
    if (!cliente) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body: CheckoutSyncBody = await request.json();
    const updateData: Record<string, unknown> = {};

    // Dados de identificação (não atualiza email e cpf)
    if (body.identificacao) {
      const { nome, telefone, dataNascimento } = body.identificacao;

      if (nome) {
        const partes = nome.trim().split(/\s+/);
        updateData.nome = partes[0];
        updateData.sobrenome = partes.slice(1).join(" ") || "";
      }

      if (telefone) {
        updateData.telefone = telefone.replace(/\D/g, "");
      }

      if (dataNascimento) {
        // Formato esperado: DD/MM/AAAA
        const [dia, mes, ano] = dataNascimento.split("/");
        if (dia && mes && ano && ano.length === 4) {
          const date = new Date(
            parseInt(ano),
            parseInt(mes) - 1,
            parseInt(dia)
          );
          if (!isNaN(date.getTime())) {
            updateData.dataNascimento = date;
          }
        }
      }
    }

    // Dados de entrega
    if (body.entrega) {
      const { cep, rua, numero, complemento, bairro, cidade, estado } =
        body.entrega;

      if (cep) updateData.cep = cep.replace(/\D/g, "");
      if (rua) updateData.endereco = rua;
      if (numero !== undefined) updateData.numero = numero;
      if (complemento !== undefined) updateData.complemento = complemento;
      if (bairro) updateData.bairro = bairro;
      if (cidade) updateData.cidade = cidade;
      if (estado) updateData.estado = estado.toUpperCase();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Nenhum dado para atualizar" });
    }

    await updateCliente(cliente.id, updateData);

    return NextResponse.json({ message: "Dados atualizados" });
  } catch (error) {
    console.error("Erro ao sincronizar dados do checkout:", error);
    return NextResponse.json(
      { error: "Erro ao sincronizar dados" },
      { status: 500 }
    );
  }
}

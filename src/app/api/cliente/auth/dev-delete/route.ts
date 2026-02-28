import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminJWTOnly } from "@/lib/admin/auth-edge";

function isProductionEnv() {
  return process.env.NODE_ENV === "production" || process.env.STAGE === "PRODUCTION";
}

async function guardDevRoute(req: NextRequest): Promise<NextResponse | null> {
  // Never expose dev-only destructive routes in production.
  if (isProductionEnv()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const token = req.cookies.get("auth_token")?.value;
  const admin = token ? await verifyAdminJWTOnly(token) : null;
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

// Dev-only: delete cliente by CPF (requires admin auth and non-production env).
export async function DELETE(request: NextRequest) {
  const guard = await guardDevRoute(request);
  if (guard) return guard;

  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get("cpf");

    if (!cpf) {
      return NextResponse.json({ error: "CPF e obrigatorio" }, { status: 400 });
    }

    const cpfLimpo = cpf.replace(/\D/g, "");

    const cliente = await prisma.cliente.findFirst({
      where: { cpf: cpfLimpo },
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente nao encontrado" }, { status: 404 });
    }

    await prisma.sessaoCliente.deleteMany({
      where: { clienteId: cliente.id },
    });

    await prisma.cliente.delete({
      where: { id: cliente.id },
    });

    return NextResponse.json({
      success: true,
      message: `Cliente ${cliente.nome} excluido com sucesso`,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir cliente" }, { status: 500 });
  }
}


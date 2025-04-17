"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  IconButton,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

interface Pagamento {
  id: string;
  info: any; // ajuste o tipo conforme necessário
  status: string;
}

interface Item {
  name: string;
  quantity: number;
  image_url: string;
  unit_amount: number;
  reference_id: string;
}

interface Pedido {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  cpf: string;
  data_nascimento: string;
  pais: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  total_pedido: number;
  items: Item[];
  salvar_minhas_informacoes: boolean;
  aceito_receber_whatsapp: boolean;
  destinatario?: string | null;
  createdAt: string;
  pagamentos?: Pagamento[] | null;
}

// export const metadata = {
//   title: "Admin - Painel de Pedidos",
// };

function PedidoRow({ pedido, index }: { pedido: Pedido; index: number }) {
  const [open, setOpen] = useState(false);
  const [openContato, setOpenContato] = useState(false); // novo estado
  const [openPaymentMethods, setOpenPaymentMethods] = useState(false);

  open ? console.log({ pedido }) : null;

  return (
    <>
      <TableRow sx={{ backgroundColor: index % 2 === 0 ? "white" : "#f5f5f5" }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{pedido.id}</TableCell>
        <TableCell>{pedido.nome}</TableCell>
        <TableCell>{pedido.sobrenome}</TableCell>
        <TableCell>{pedido.email}</TableCell>
        <TableCell>
          {pedido.total_pedido.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </TableCell>
        <TableCell>
          {new Date(pedido.createdAt).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </TableCell>
        <TableCell>
          {pedido.pagamentos && pedido.pagamentos.length > 0 ? (
            pedido.pagamentos.map((pagamento, idx) => (
              <Box
                key={idx}
                sx={{
                  mb: 1,
                  p: 1,
                  border: "1px solid #ccc",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2">
                  <strong>ID:</strong> {pagamento.id}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {pagamento.status}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2">Sem pagamentos</Typography>
          )}
        </TableCell>
      </TableRow>

      {/* Collapse principal - Itens do pedido + botão para dados adicionais */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="subtitle2" gutterBottom>
                Itens do Pedido
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nome do Item</TableCell>
                    <TableCell>Quantidade</TableCell>
                    <TableCell>Valor Unitário</TableCell>
                    <TableCell>Reference ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedido.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {(item.unit_amount / 100).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell>{item.reference_id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Botão para abrir o segundo collapse */}
              <Button
                variant="text"
                size="small"
                sx={{ mt: 2 }}
                onClick={() => setOpenContato(!openContato)}
              >
                {openContato ? "Ocultar" : "Ver"} dados de contato e entrega
              </Button>

              {/* Segundo Collapse com os dados pessoais */}
              <Collapse in={openContato} timeout="auto" unmountOnExit>
                <Box mt={1} p={1} border="1px solid #ccc" borderRadius={1}>
                  <Typography variant="body2">
                    <strong>Telefone:</strong> {pedido.telefone}
                  </Typography>
                  <Typography variant="body2">
                    <strong>CPF:</strong> {pedido.cpf}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Data de Nascimento:</strong>{" "}
                    {new Date(pedido.data_nascimento).toLocaleDateString(
                      "pt-BR",
                    )}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Endereço:</strong> {pedido.endereco},{" "}
                    {pedido.numero}
                    {pedido.complemento ? `, ${pedido.complemento}` : ""},{" "}
                    {pedido.bairro} - {pedido.cidade} / {pedido.estado} -{" "}
                    {pedido.cep}
                  </Typography>
                  <Typography variant="body2">
                    <strong>País:</strong> {pedido.pais}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Aceita WhatsApp:</strong>{" "}
                    {pedido.aceito_receber_whatsapp ? "Sim" : "Não"}
                  </Typography>
                </Box>
              </Collapse>

              <br />

              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => setOpenPaymentMethods((prev) => !prev)}
              >
                {openPaymentMethods ? "Ocultar" : "Ver"} método(s) de pagamento
              </Button>

              <Collapse in={openPaymentMethods} timeout="auto" unmountOnExit>
                {pedido.pagamentos?.map((pagamento, pIdx) => (
                  <Box
                    key={pIdx}
                    sx={{
                      mt: 1,
                      p: 1,
                      border: "1px dashed #aaa",
                      borderRadius: 1,
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Pagamento #{pIdx + 1}
                    </Typography>
                    {(() => {
                      const charge = pagamento?.info?.charges?.[0];
                      const chargeStatus = charge?.status;

                      let statusLabel = chargeStatus || "Desconhecido";
                      let color: string = "text.secondary";

                      if (chargeStatus === "PAID") {
                        statusLabel = "Sucesso";
                        color = "green";
                      } else if (chargeStatus === "IN_ANALYSIS") {
                        statusLabel = "Em análise";
                        color = "orange";
                      } else if (
                        chargeStatus &&
                        chargeStatus !== "PAID" &&
                        chargeStatus !== "IN_ANALYSIS"
                      ) {
                        // status conhecido, mas não mapeado (ex: "FAILED", "CANCELLED")
                        statusLabel = chargeStatus;
                        color = "red";
                      }

                      return (
                        <Typography
                          variant="body2"
                          sx={{ color, fontWeight: "bold" }}
                        >
                          Status do Pagamento: {statusLabel}
                        </Typography>
                      );
                    })()}
                    {pagamento.info?.charges?.map(
                      (charge: any, cIdx: number) => (
                        <Box key={cIdx} sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Charge ID:</strong> {charge.id}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Valor:</strong>{" "}
                            {(charge.amount.value / 100).toLocaleString(
                              "pt-BR",
                              {
                                style: "currency",
                                currency: charge.amount.currency,
                              },
                            )}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Método:</strong>{" "}
                            {charge.payment_method?.type ?? "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Parcelas:</strong>{" "}
                            {charge.payment_method?.installments ?? "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>End to End ID:</strong>{" "}
                            {charge.payment_method?.pix?.end_to_end_id ?? "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Nome do Titular:</strong>{" "}
                            {charge.payment_method?.pix?.holder?.name ?? "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>CPF do Titular:</strong>{" "}
                            {charge.payment_method?.pix?.holder?.tax_id ??
                              "N/A"}
                          </Typography>
                        </Box>
                      ),
                    )}
                  </Box>
                ))}
              </Collapse>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Controle de paginação (exemplo simples)
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/pedidos?page=${page}&pageSize=${pageSize}`,
        );
        if (!response.ok) {
          throw new Error("Erro ao buscar os pedidos.");
        }
        const data = await response.json();
        setPedidos(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erro desconhecido.");
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [page]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Lista de Pedidos
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {/* Coluna para o botão de expandir */}
              <TableCell />
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Sobrenome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Total do Pedido</TableCell>
              <TableCell>Criado Em</TableCell>
              <TableCell>Pagamentos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidos.map((pedido, index) => (
              <PedidoRow key={pedido.id} pedido={pedido} index={index} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="subtitle1" mt={2}>
        Controles de paginação (exemplo simples)
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
        <Button
          variant="contained"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Página Anterior
        </Button>
        <Typography variant="body1" sx={{ alignSelf: "center" }}>
          Página {page}
        </Typography>
        <Button variant="contained" onClick={() => setPage((prev) => prev + 1)}>
          Próxima Página
        </Button>
      </Stack>
    </Box>
  );
}

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
} from "@mui/material";

interface Pagamento {
  id: string;
  info: any; // ajuste o tipo conforme necessário
  status: string;
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
  salvar_minhas_informacoes: boolean;
  aceito_receber_whatsapp: boolean;
  destinatario?: string | null;
  createdAt: string;
  pagamentos?: Pagamento[] | null;
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
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Sobrenome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Criado Em</TableCell>
              <TableCell>Pagamentos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{pedido.id}</TableCell>
                <TableCell>{pedido.nome}</TableCell>
                <TableCell>{pedido.sobrenome}</TableCell>
                <TableCell>{pedido.email}</TableCell>
                <TableCell>
                  {new Date(pedido.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {pedido.pagamentos && pedido.pagamentos.length > 0 ? (
                    pedido.pagamentos.map((pagamento, index) => (
                      <Box
                        key={index}
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

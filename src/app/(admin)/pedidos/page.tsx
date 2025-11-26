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
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  Grid,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import RefreshIcon from "@mui/icons-material/Refresh";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useSnackbar } from "notistack";

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
  frete_calculado: number;
  transportadora_nome?: string | null;
  transportadora_servico?: string | null;
  transportadora_prazo?: number | null;
  items: Item[];
  salvar_minhas_informacoes: boolean;
  aceito_receber_whatsapp: boolean;
  destinatario?: string | null;
  createdAt: string;
  pagamentos?: Pagamento[] | null;
  cupons: any[];
  notaFiscalGerada?: boolean;
  notaFiscalId?: string | null;
  notaFiscalErro?: string | null;
}

// export const metadata = {
//   title: "Admin - Painel de Pedidos",
// };

function PedidoRow({ pedido, index, onNotaGerada }: { pedido: Pedido; index: number; onNotaGerada: () => void }) {
  const [open, setOpen] = useState(false);
  const [openContato, setOpenContato] = useState(false);
  const [openPaymentMethods, setOpenPaymentMethods] = useState(false);
  const [generatingNota, setGeneratingNota] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleGerarNota = async () => {
    setGeneratingNota(true);
    try {
      const response = await fetch(`/api/pedidos/${pedido.id}/gerar-nota`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        enqueueSnackbar('Nota fiscal gerada com sucesso!', { variant: 'success' });
        onNotaGerada();
      } else {
        enqueueSnackbar(data.message || 'Erro ao gerar nota fiscal', { variant: 'error' });
      }
    } catch (error) {
      console.error('Erro ao gerar nota:', error);
      enqueueSnackbar('Erro ao gerar nota fiscal', { variant: 'error' });
    } finally {
      setGeneratingNota(false);
    }
  };

  const getPaymentStatusChip = (status: string) => {
    const statusMap: Record<string, { label: string; color: any }> = {
      'PAID': { label: 'Pago', color: 'success' },
      'IN_ANALYSIS': { label: 'Em Análise', color: 'warning' },
      'FAILED': { label: 'Falhou', color: 'error' },
      'CANCELLED': { label: 'Cancelado', color: 'error' },
      'WAITING_PAYMENT': { label: 'Aguardando', color: 'info' },
    };

    return statusMap[status] || { label: status, color: 'default' };
  };

  return (
    <>
      <TableRow 
        sx={{ 
          backgroundColor: index % 2 === 0 ? "white" : "#f8fafc",
          '&:hover': {
            backgroundColor: '#f1f5f9',
          },
          transition: 'background-color 0.2s ease',
        }}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{
              color: open ? '#1976d2' : '#64748b',
              '&:hover': {
                backgroundColor: '#e3f2fd',
              }
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#64748b'
            }}
          >
            #{pedido.id.slice(-8)}
          </Typography>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, bgcolor: '#1976d2' }}>
              <PersonIcon sx={{ fontSize: 14 }} />
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {pedido.nome}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {pedido.sobrenome}
          </Typography>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon sx={{ fontSize: 16, color: '#64748b' }} />
            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {pedido.email}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 600,
              color: '#059669',
              fontSize: '0.95rem'
            }}
          >
            {pedido.total_pedido.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              color: '#0369a1',
              fontSize: '0.85rem'
            }}
          >
            {pedido.frete_calculado.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
            {new Date(pedido.createdAt).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </TableCell>
        <TableCell>
          {pedido.pagamentos && pedido.pagamentos.length > 0 ? (
            <Stack spacing={0.5}>
              {pedido.pagamentos.map((pagamento, idx) => {
                const charge = pagamento?.info?.charges?.[0];
                const status = charge?.status || pagamento.status;
                const statusConfig = getPaymentStatusChip(status);

                return (
                  <Chip
                    key={idx}
                    label={statusConfig.label}
                    color={statusConfig.color}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                );
              })}
            </Stack>
          ) : (
            <Chip
              label="Sem pagamento"
              color="default"
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
        </TableCell>
        <TableCell>
          {pedido.notaFiscalGerada ? (
            <Chip
              label="NF Gerada"
              color="success"
              size="small"
              icon={<ReceiptIcon />}
              sx={{ fontSize: '0.7rem', height: 24 }}
            />
          ) : pedido.notaFiscalErro ? (
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={generatingNota ? <CircularProgress size={14} /> : <ReceiptIcon />}
              onClick={handleGerarNota}
              disabled={generatingNota}
              sx={{ fontSize: '0.7rem', py: 0.5 }}
            >
              Erro - Tentar
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={generatingNota ? <CircularProgress size={14} /> : <ReceiptIcon />}
              onClick={handleGerarNota}
              disabled={generatingNota}
              sx={{ fontSize: '0.7rem', py: 0.5 }}
            >
              Gerar NF
            </Button>
          )}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, backgroundColor: '#f8fafc', borderRadius: 2, p: 2 }}>
              
              {/* Seção de Itens do Pedido */}
              <Card sx={{ mb: 2, boxShadow: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <ShoppingCartIcon sx={{ color: '#1976d2' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Itens do Pedido
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {pedido.items.map((item, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            border: '1px solid #e2e8f0',
                            borderRadius: 2,
                            backgroundColor: 'white',
                            '&:hover': {
                              boxShadow: 2,
                            },
                            transition: 'box-shadow 0.2s ease'
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                            Quantidade: <strong>{item.quantity}</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#059669', fontWeight: 600 }}>
                            {item.unit_amount.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                            ID: {item.reference_id}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {pedido.cupons && pedido.cupons.length > 0 && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#f0f9ff', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Cupons Aplicados
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {pedido.cupons.map((cupom, idx) => (
                          <Chip
                            key={idx}
                            label={cupom}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Botões de Ação */}
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PersonIcon />}
                  onClick={() => setOpenContato(!openContato)}
                  sx={{
                    borderColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                    }
                  }}
                >
                  {openContato ? "Ocultar" : "Ver"} Dados do Cliente
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CreditCardIcon />}
                  onClick={() => setOpenPaymentMethods(!openPaymentMethods)}
                  sx={{
                    borderColor: '#059669',
                    color: '#059669',
                    '&:hover': {
                      backgroundColor: '#f0fdf4',
                    }
                  }}
                >
                  {openPaymentMethods ? "Ocultar" : "Ver"} Pagamentos
                </Button>
              </Stack>

              {/* Dados do Cliente */}
              <Collapse in={openContato} timeout="auto" unmountOnExit>
                <Card sx={{ mb: 2, boxShadow: 1 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ color: '#1976d2' }} />
                      Informações do Cliente
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: '#64748b' }} />
                          <Typography variant="body2">
                            <strong>Telefone:</strong> {pedido.telefone}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>CPF:</strong> {pedido.cpf}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Data de Nascimento:</strong>{" "}
                          {new Date(pedido.data_nascimento).toLocaleDateString("pt-BR")}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            <strong>WhatsApp:</strong>
                          </Typography>
                          <Chip
                            label={pedido.aceito_receber_whatsapp ? "Aceita" : "Não aceita"}
                            color={pedido.aceito_receber_whatsapp ? "success" : "default"}
                            size="small"
                          />
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 16, color: '#64748b', mt: 0.5 }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Endereço de Entrega:
                            </Typography>
                            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                              {pedido.endereco}, {pedido.numero}
                              {pedido.complemento && `, ${pedido.complemento}`}
                              <br />
                              {pedido.bairro} - {pedido.cidade}/{pedido.estado}
                              <br />
                              CEP: {pedido.cep} - {pedido.pais}
                            </Typography>
                            <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e2e8f0' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0369a1' }}>
                                Frete: {pedido.frete_calculado.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </Typography>
                              {pedido.transportadora_nome && (
                                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#64748b', mt: 0.5 }}>
                                  {pedido.transportadora_nome} - {pedido.transportadora_servico}
                                  {pedido.transportadora_prazo && (
                                    <> ({pedido.transportadora_prazo} {pedido.transportadora_prazo === 1 ? 'dia útil' : 'dias úteis'})</>
                                  )}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Collapse>

              {/* Métodos de Pagamento */}
              <Collapse in={openPaymentMethods} timeout="auto" unmountOnExit>
                <Card sx={{ boxShadow: 1 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCardIcon sx={{ color: '#059669' }} />
                      Métodos de Pagamento
                    </Typography>
                    
                    {pedido.pagamentos?.length ? (
                      <Stack spacing={2}>
                        {pedido.pagamentos.map((pagamento, pIdx) => {
                          const charge = pagamento?.info?.charges?.[0];
                          const status = charge?.status || pagamento.status;
                          const statusConfig = getPaymentStatusChip(status);
                          
                          return (
                            <Box
                              key={pIdx}
                              sx={{
                                p: 2,
                                border: '1px solid #e2e8f0',
                                borderRadius: 2,
                                backgroundColor: 'white',
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  Pagamento #{pIdx + 1}
                                </Typography>
                                <Chip
                                  label={statusConfig.label}
                                  color={statusConfig.color}
                                  size="small"
                                />
                              </Box>
                              
                              {charge && (
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                      <strong>ID da Transação:</strong>
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748b' }}>
                                      {charge.id}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                      <strong>Valor:</strong>
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#059669' }}>
                                      {(charge.amount.value / 100).toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: charge.amount.currency,
                                      })}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <Typography variant="body2">
                                      <strong>Método:</strong> {charge.payment_method?.type ?? "N/A"}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <Typography variant="body2">
                                      <strong>Parcelas:</strong> {charge.payment_method?.installments ?? "N/A"}
                                    </Typography>
                                  </Grid>
                                  {charge.payment_method?.pix && (
                                    <>
                                      <Grid item xs={12}>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                          Dados PIX
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <Box>
                                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                                            <strong>End to End ID:</strong>
                                          </Typography>
                                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                            {charge.payment_method.pix.end_to_end_id || "N/A"}
                                          </Typography>
                                        </Box>
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <Typography variant="body2">
                                          <strong>Titular:</strong> {charge.payment_method.pix.holder?.name || "N/A"}
                                        </Typography>
                                        <Typography variant="body2">
                                          <strong>CPF:</strong> {charge.payment_method.pix.holder?.tax_id || "N/A"}
                                        </Typography>
                                      </Grid>
                                    </>
                                  )}
                                </Grid>
                              )}
                            </Box>
                          );
                        })}
                      </Stack>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 2 }}>
                        Nenhum método de pagamento registrado
                      </Typography>
                    )}
                  </CardContent>
                </Card>
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filterMode, setFilterMode] = useState<'hideTests' | 'showOnlyTests'>('hideTests');
  // Controle de paginação (exemplo simples)
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchPedidos = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setInitialLoading(true);
    }

    try {
      const response = await fetch(
        `/api/pedidos?page=${page}&pageSize=${pageSize}&filterMode=${filterMode}`,
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
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setInitialLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPedidos(false);
  }, [page, filterMode]);

  if (initialLoading) {
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
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: '#1e293b',
            mb: 1 
          }}
        >
          Painel de Pedidos
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          Gerencie e visualize todos os pedidos da loja
        </Typography>
      </Box>

      {/* Filtros e Estatísticas */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCartIcon sx={{ color: '#1976d2' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total: {pedidos.length} pedidos
                </Typography>
              </Box>
              <Chip 
                label={filterMode === 'hideTests' ? 'Sem testes' : 'Apenas testes'}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={() => fetchPedidos(true)}
                disabled={refreshing}
                sx={{
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#e3f2fd',
                    borderColor: '#1565c0',
                  }
                }}
              >
                {refreshing ? 'Atualizando...' : 'Atualizar'}
              </Button>

              <ToggleButtonGroup
                value={filterMode}
                exclusive
                onChange={(e, newMode) => {
                  if (newMode !== null) {
                    setFilterMode(newMode);
                  }
                }}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    borderColor: '#e2e8f0',
                    '&.Mui-selected': {
                      backgroundColor: '#1976d2',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#1565c0',
                      }
                    }
                  }
                }}
              >
                <ToggleButton value="hideTests">
                  Ocultar Testes
                </ToggleButton>
                <ToggleButton value="showOnlyTests">
                  Mostrar Apenas Testes
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabela de Pedidos */}
      <Card sx={{ boxShadow: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                <TableCell />
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Sobrenome</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Frete</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Data</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Nota Fiscal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidos.map((pedido, index) => (
                <PedidoRow key={pedido.id} pedido={pedido} index={index} onNotaGerada={() => fetchPedidos(true)} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Paginação */}
      <Card sx={{ mt: 3, boxShadow: 1 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
            Navegação
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            <Button
              variant="outlined"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              sx={{
                borderColor: '#e2e8f0',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                }
              }}
            >
              Anterior
            </Button>
            <Box sx={{ px: 3, py: 1, backgroundColor: '#f1f5f9', borderRadius: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Página {page}
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              onClick={() => setPage((prev) => prev + 1)}
              sx={{
                borderColor: '#e2e8f0',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                }
              }}
            >
              Próxima
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

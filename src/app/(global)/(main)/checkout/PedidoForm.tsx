"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  TextField,
  Stack,
  Typography,
  CircularProgress,
  IconButton,
  InputAdornment,
  Alert,
  Link,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { postPedido } from "@/modules/pedido/domain";
import { useMeuContexto } from "@/components/common/Context/context";
import MaskedInput from "./MaskedInput";
import { useSnackbar } from "notistack";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { parse, isValid } from "date-fns";
import { pushUserDataToDataLayer } from "../home/form-email";
import { waitForGTMReady } from "@/utils/gtm-ready-helper";
import { FiSearch } from "react-icons/fi";
import QuickLoginModal from "./QuickLoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { createCloseAction } from "@/utils/snackbar-helpers";
import { useFreight } from "@/hooks/useFreight";
import EnderecoSelector from "./EnderecoSelector";

// Definição do schema com zod
const pedidoSchema = z.object({
  nome: z.string().nonempty("O nome é obrigatório"),
  sobrenome: z.string().nonempty("O sobrenome é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().nonempty("Telefone é obrigatório"),
  cpf: z.string().nonempty("CPF é obrigatório"),
  data_nascimento: z.preprocess(
    (arg) => {
      if (typeof arg === "string" && arg.length === 8) {
        const dia = arg.slice(0, 2);
        const mes = arg.slice(2, 4);
        const ano = arg.slice(4, 8);
        const dataFormatada = `${dia}/${mes}/${ano}`;
        const parsed = parse(dataFormatada, "dd/MM/yyyy", new Date());

        if (!isValid(parsed)) return undefined;

        // Ajuste para meio-dia (12h) local para evitar mudança de dia no UTC
        parsed.setHours(12, 0, 0, 0);

        return parsed;
      }
      return undefined;
    },
    z.date({
      required_error: "Data de nascimento é obrigatória",
      invalid_type_error: "Data inválida",
    }),
  ),
  pais: z.string().default("Brasil"),
  cep: z.string().nonempty("CEP é obrigatório"),
  endereco: z.string().nonempty("Endereço é obrigatório"),
  numero: z.string().nonempty("Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().nonempty("Bairro é obrigatório"),
  cidade: z.string().nonempty("Cidade é obrigatório"),
  estado: z.string().nonempty("Estado é obrigatório"),
  salvar_minhas_informacoes: z.boolean(),
  aceito_receber_whatsapp: z.boolean(),
  destinatario: z.string().optional(),
});

// Define o tipo do formulário a partir do schema
export type PedidoFormData = z.infer<typeof pedidoSchema> & {
  items?: any[];
  descontos?: number;
  cupons?: string[];
  total_pedido?: number;
  frete_calculado?: number;
  transportadora_nome?: string | null;
  transportadora_servico?: string | null;
  transportadora_prazo?: number | null;
};

// Dados iniciais do formulário
const defaultPedidoFormData: PedidoFormData = {
  nome: "",
  sobrenome: "",
  email: "",
  telefone: "",
  cpf: "",
  data_nascimento: undefined,
  pais: "Brasil",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "Manaus",
  estado: "Amazonas",
  salvar_minhas_informacoes: false,
  aceito_receber_whatsapp: false,
  destinatario: "",
} as unknown as PedidoFormData;

// Interface para dados do cliente logado
interface ClienteLogado {
  id: string;
  email: string;
  nome: string;
  sobrenome: string;
  cpf?: string;
  telefone?: string;
  dataNascimento?: string;
  endereco?: {
    cep?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
  receberWhatsapp?: boolean;
}

const PedidoForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingClienteCheck, setLoadingClienteCheck] = useState(true);
  const [clienteLogado, setClienteLogado] = useState<ClienteLogado | null>(null);
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const { cart, total, descontos, cupons, freight } = useMeuContexto();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { checkAuth } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PedidoFormData>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      ...defaultPedidoFormData,
      pais: "Brasil", // Garantir que país sempre tenha valor padrão
    },
  });

  const fieldRefs: Partial<
    Record<keyof PedidoFormData, React.RefObject<HTMLInputElement | null>>
  > = {
    nome: React.useRef(null),
    sobrenome: React.useRef(null),
    email: React.useRef(null),
    telefone: React.useRef(null),
    cpf: React.useRef(null),
    data_nascimento: React.useRef(null),
    pais: React.useRef(null),
    cep: React.useRef(null),
    endereco: React.useRef(null),
    numero: React.useRef(null),
    bairro: React.useRef(null),
    cidade: React.useRef(null),
    estado: React.useRef(null),
  };

  async function onSubmit(data: PedidoFormData) {
    setLoading(true);
    closeSnackbar();

    try {
      const items: any[] = Object.entries(cart).map(([id, product]: any) => ({
        reference_id: id,
        name: product.nome,
        quantity: product.quantity,
        preco: product.preco,
        unit_amount: Math.trunc(product.preco * 100),
        image_url:
          process.env.NEXT_PUBLIC_STRAPI_URL +
          product.carouselImagensPrincipal?.[0]?.imagem?.formats?.medium?.url,
        bling_number: product.bling_number,
      }));

      const gaDataForAPI = await waitForGTMReady();
      const freightData = freight.getSelectedFreightData();

      console.log("🚚 Dados de frete do contexto:", freightData);

      const result = await postPedido({
        ...data,
        items: items,
        cupons: cupons?.map((c: any) => c.codigo),
        descontos: Math.trunc(descontos * 100),
        total_pedido: total,
        ...freightData,
        ...gaDataForAPI,
      });

      console.log("Resposta da API:", result);

      // Caso a API retorne erro, exibe as mensagens específicas usando notistack
      if (result.error) {
        // Tratamento específico para email já existente
        if (result.code === 'EMAIL_ALREADY_EXISTS') {
          enqueueSnackbar(result.error, {
            variant: "error",
            persist: true,
            action: (key) => (
              <IconButton onClick={() => closeSnackbar(key)} size="small">
                <CloseIcon sx={{ color: "white" }} />
              </IconButton>
            ),
          });
          setLoading(false);
          return;
        }

        const errorMessages = result.details?.error_messages;
        if (Array.isArray(errorMessages)) {
          errorMessages.forEach((err: any) => {
            if (err.parameter_name === "customer.tax_id") {
              enqueueSnackbar("CPF inválido.", {
                variant: "error",
                persist: true,
                action: (key) => (
                  <IconButton onClick={() => closeSnackbar(key)} size="small">
                    <CloseIcon sx={{ color: "white" }} />
                  </IconButton>
                ),
              });
            }
            if (err.parameter_name === "customer.phone.number") {
              enqueueSnackbar("Telefone inválido.", {
                variant: "error",
                persist: true,
                action: (key) => (
                  <IconButton onClick={() => closeSnackbar(key)} size="small">
                    <CloseIcon sx={{ color: "white" }} />
                  </IconButton>
                ),
              });
            }
          });
        } else {
          enqueueSnackbar("Erro ao processar o pagamento.", {
            variant: "error",
          });
        }
        setLoading(false);
        return;
      }

      await pushUserDataToDataLayer({
        email: data.email,
        phone: data.telefone,
      });

      const gaData = await waitForGTMReady();
      
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "AddPaymentInfo",
        event_id: `addpaymentinfo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ecommerce: {
          currency: "BRL",
          value: total,
          items: items.map((item) => ({
            item_id: item?.reference_id ?? "",
            item_name: decodeURIComponent(item?.name ?? ""),
            price: item?.preco ?? 0,
            quantity: item?.quantity ?? 1,
          })),
        },
        ...gaData,
      });

      // Mensagens de feedback sobre criação de conta
      if (result?.contaCriada) {
        enqueueSnackbar("Conta criada com sucesso! Você já está logado.", {
          variant: "success",
          persist: true,
          action: createCloseAction
        });
      } else if (result?.clienteVinculado) {
        enqueueSnackbar("Pedido vinculado à sua conta!", {
          variant: "success",
          action: createCloseAction
        });
      }

      // Redirecionar para a nova página de pagamento (Checkout Transparente)
      enqueueSnackbar("Redirecionando para o pagamento...", {
        variant: "success",
        action: createCloseAction
      });

      // Calcular total com frete
      const totalComFrete = total + (freightData.frete_calculado || 0);

      // Redirecionar para página de pagamento interno (Checkout Transparente PagBank)
      window.location.href = `/checkout/pagamento?pedidoId=${result.id}&total=${Math.trunc(totalComFrete * 100)}`;

      // OPÇÃO ANTIGA: Redirecionar para PagSeguro (API antiga)
      // window.location.href = result?.link;
    } catch (error) {
      console.error("Erro:", error);
      enqueueSnackbar("Erro ao enviar o pedido.", { variant: "error" });
    }
    setLoading(false);
  }

  const theme = createTheme();
  const [loadingFormData, setLoadingFormData] = useState(true);

  // Salva os dados no localStorage sempre que houver mudanças
  const saveToLocalStorage = (data: PedidoFormData) => {
    localStorage.setItem("formulario_pedido", JSON.stringify(data));
  };

  useEffect(() => {
    const savedData = localStorage.getItem("formulario_pedido");
    if (savedData) {
      const parsedData: PedidoFormData = JSON.parse(savedData);

      const camposMascarados = [
        "telefone",
        "cpf",
        "cep",
        // "data_nascimento"
      ];

      Object.keys(parsedData).forEach((key) => {
        const campo = key as keyof PedidoFormData;
        let valor = parsedData[campo];

        // Força string para campos com máscara
        if (camposMascarados.includes(key)) {
          // Se for data_nascimento, tenta converter para Date
          if (key === "data_nascimento") {
            valor = new Date(valor as string);
            if (isNaN(valor.getTime())) {
              // valor = new Date();
            }
          } else {
            valor = String(valor ?? "");
          }
        }

        setValue(campo, valor);
      });
    }
    setLoadingFormData(false); // indica que os dados foram carregados
  }, [setValue]);

  // Atualiza o localStorage automaticamente ao mudar um campo
  useEffect(() => {
    const subscription = watch((data) => {
      const completeData: PedidoFormData = {
        ...defaultPedidoFormData,
        ...data,
        telefone: String(data.telefone ?? ""),
        cpf: String(data.cpf ?? ""),
        cep: String(data.cep ?? ""),
        // data_nascimento: data.data_nascimento ?? new Date(), // já é Date
        cupons: undefined,
      };
      saveToLocalStorage(completeData);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const buscarEnderecoPorCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      enqueueSnackbar("CEP inválido. Digite os 8 números.", {
        variant: "warning",
      });
      setValue("cep", ""); // limpa o campo
      return;
    }

    setLoadingCep(true);
    try {
      const { data } = await axios.get(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );
      if (data.erro) {
        enqueueSnackbar("CEP não encontrado.", { variant: "warning" });
        setValue("cep", ""); // limpa o campo se não encontrado
        return;
      }

      if (data.localidade.toLowerCase() !== "manaus") {
        enqueueSnackbar("Só aceitamos pedidos para a cidade de Manaus.", {
          variant: "error",
        });
        setValue("cep", ""); // limpa o campo se não for Manaus
        setValue("cidade", "");
        setValue("estado", "");
        setValue("endereco", "");
        setValue("bairro", "");
        return;
      }

      setValue("endereco", data.logradouro || "");
      setValue("bairro", data.bairro || "");
      setValue("cidade", data.localidade || "");
      setValue("estado", data.uf || "");
    } catch (error) {
      enqueueSnackbar("Erro ao buscar endereço pelo CEP.", {
        variant: "error",
      });
      setValue("cep", ""); // limpa se houver erro na requisição
    } finally {
      setLoadingCep(false);
    }
  };

  const [loadingCep, setLoadingCep] = useState(false);

  // Função para verificar se cliente está logado
  const verificarClienteLogado = async () => {
    try {
      const response = await fetch('/api/cliente/auth/verificar');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.cliente) {
          setClienteLogado(data.cliente);
          // Pré-preencher formulário com dados do cliente
          await preencherFormularioComDadosCliente(data.cliente);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar cliente:', error);
    } finally {
      setLoadingClienteCheck(false);
    }
  };

  // Função para pré-preencher formulário com dados do cliente
  const preencherFormularioComDadosCliente = async (cliente: any) => {
    setValue('nome', cliente.nome || '');
    setValue('sobrenome', cliente.sobrenome || '');
    setValue('email', cliente.email || '');
    
    if (cliente.cpf) setValue('cpf', cliente.cpf);
    if (cliente.telefone) setValue('telefone', cliente.telefone);
    
    // Tratar data de nascimento
    if (cliente.dataNascimento) {
      // Converter string ISO para formato DD/MM/AAAA
      const data = new Date(cliente.dataNascimento);
      if (!isNaN(data.getTime())) {
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        const dataFormatada = `${dia}${mes}${ano}`;
        setValue('data_nascimento', dataFormatada as any);
      }
    }
    
    // Buscar endereço principal dos novos endereços cadastrados
    try {
      const response = await fetch('/api/cliente/enderecos/checkout');
      if (response.ok) {
        const data = await response.json();
        if (data.enderecoPrincipal) {
          // Usar endereço principal dos endereços cadastrados
          const endereco = data.enderecoPrincipal;
          setValue('cep', endereco.cep);
          setValue('endereco', endereco.endereco);
          setValue('numero', endereco.numero);
          setValue('complemento', endereco.complemento || '');
          setValue('bairro', endereco.bairro);
          setValue('cidade', endereco.cidade);
          setValue('estado', endereco.estado);
          setValue('destinatario', endereco.destinatario || '');
        } else if (cliente.endereco) {
          // Fallback para endereço legado no cliente
          if (cliente.endereco.cep) setValue('cep', cliente.endereco.cep);
          if (cliente.endereco.endereco) setValue('endereco', cliente.endereco.endereco);
          if (cliente.endereco.numero) setValue('numero', cliente.endereco.numero);
          if (cliente.endereco.complemento) setValue('complemento', cliente.endereco.complemento);
          if (cliente.endereco.bairro) setValue('bairro', cliente.endereco.bairro);
          if (cliente.endereco.cidade) setValue('cidade', cliente.endereco.cidade);
          if (cliente.endereco.estado) setValue('estado', cliente.endereco.estado);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar endereço principal:', error);
      // Fallback para endereço legado do cliente
      if (cliente.endereco) {
        if (cliente.endereco.cep) setValue('cep', cliente.endereco.cep);
        if (cliente.endereco.endereco) setValue('endereco', cliente.endereco.endereco);
        if (cliente.endereco.numero) setValue('numero', cliente.endereco.numero);
        if (cliente.endereco.complemento) setValue('complemento', cliente.endereco.complemento);
        if (cliente.endereco.bairro) setValue('bairro', cliente.endereco.bairro);
        if (cliente.endereco.cidade) setValue('cidade', cliente.endereco.cidade);
        if (cliente.endereco.estado) setValue('estado', cliente.endereco.estado);
      }
    }
    
    if (cliente.receberWhatsapp !== undefined) {
      setValue('aceito_receber_whatsapp', cliente.receberWhatsapp);
    }
  };

  // Verificar cliente logado ao carregar componente
  useEffect(() => {
    verificarClienteLogado();
  }, []);

  useEffect(() => {
    const firstErrorField = Object.keys(errors)[0] as keyof PedidoFormData;
    const ref = fieldRefs[firstErrorField];

    if (ref?.current) {
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        ref.current?.focus();
      }, 100);
    } else {
      // 👇 Gambiarra: scrolla para o label do campo com erro
      const labelElement = document.getElementById(`label-${firstErrorField}`);
      if (labelElement) {
        setTimeout(() => {
          labelElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    }
  }, [errors]);

  // Função para quando um endereço é selecionado no seletor
  const handleEnderecoSelecionado = (endereco: any) => {
    if (endereco) {
      // Preencher campos com dados do endereço selecionado
      setValue('cep', endereco.cep);
      setValue('endereco', endereco.endereco);
      setValue('numero', endereco.numero);
      setValue('complemento', endereco.complemento || '');
      setValue('bairro', endereco.bairro);
      setValue('cidade', endereco.cidade);
      setValue('estado', endereco.estado);
      setValue('destinatario', endereco.destinatario || '');
    } else {
      // Limpar campos para permitir inserção manual
      setValue('cep', '');
      setValue('endereco', '');
      setValue('numero', '');
      setValue('complemento', '');
      setValue('bairro', '');
      setValue('cidade', 'Manaus');
      setValue('estado', 'Amazonas');
      setValue('destinatario', '');
    }
  };

  // Função para fazer logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/cliente/auth/sair', {
        method: 'POST',
      });
      if (response.ok) {
        // Atualizar o AuthContext global
        await checkAuth();
        
        setClienteLogado(null);
        // Limpar campos preenchidos automaticamente (exceto localStorage)
        setValue('nome', '');
        setValue('sobrenome', '');
        setValue('email', '');
        setValue('cpf', '');
        setValue('telefone', '');
        setValue('cep', '');
        setValue('endereco', '');
        setValue('numero', '');
        setValue('complemento', '');
        setValue('bairro', '');
        setValue('cidade', 'Manaus');
        setValue('estado', 'Amazonas');
        setValue('aceito_receber_whatsapp', false);
        
        enqueueSnackbar('Logout realizado com sucesso', { 
          variant: 'success',
          action: createCloseAction
        });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      enqueueSnackbar('Erro ao fazer logout', { variant: 'error' });
    }
  };

  if (loadingFormData || loadingClienteCheck) {
    return <div>Carregando...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 800, margin: "auto", padding: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Formulário de Pedido
        </Typography>
        
        {/* Status do Cliente - Logado ou Não Logado */}
        {clienteLogado ? (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleLogout}
                sx={{ textDecoration: 'underline' }}
              >
                Sair
              </Button>
            }
          >
            <Typography variant="body2">
              Olá, <strong>{clienteLogado.nome} {clienteLogado.sobrenome}</strong>! 
              Seus dados foram preenchidos automaticamente.
            </Typography>
          </Alert>
        ) : (
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => setShowQuickLogin(true)}
                sx={{ textDecoration: 'underline' }}
              >
                Entrar
              </Button>
            }
          >
            <Typography variant="body2">
              Já é cliente? <Link component="button" onClick={() => setShowQuickLogin(true)}>
                Faça login para preencher automaticamente
              </Link>
            </Typography>
          </Alert>
        )}
        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              e.target instanceof HTMLInputElement &&
              e.target.type !== "textarea"
            ) {
              e.preventDefault();
            }
          }}
        >
          <Stack spacing={2}>
            {/* Campos do formulário (nome, sobrenome, email, etc.) */}
            <TextField
              inputRef={fieldRefs.nome}
              fullWidth
              label="Nome"
              placeholder="Seu nome"
              error={!!errors.nome}
              helperText={errors.nome?.message}
              {...register("nome")}
            />

            <TextField
              inputRef={fieldRefs.sobrenome}
              fullWidth
              label="Sobrenome"
              placeholder="Seu sobrenome"
              error={!!errors.sobrenome}
              helperText={errors.sobrenome?.message}
              {...register("sobrenome")}
            />

            <TextField
              inputRef={fieldRefs.email}
              fullWidth
              label="Email"
              type="email"
              placeholder="seuemail@exemplo.com"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register("email")}
            />

            {/* Telefone com máscara */}
            <FormControl fullWidth error={!!errors.telefone}>
              <FormLabel id="label-telefone">Telefone</FormLabel>
              <Controller
                name="telefone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="(00) 00000-0000"
                    InputProps={{
                      inputComponent: MaskedInput as any,
                      inputProps: {
                        mask: [
                          {
                            mask: "(00) 0000-0000",
                          },
                          {
                            mask: "(00) 00000-0000",
                          },
                        ],
                        name: field.name,
                      },
                    }}
                    error={!!errors.telefone}
                    helperText={errors.telefone?.message}
                  />
                )}
              />
            </FormControl>

            {/* CPF com máscara */}
            <FormControl fullWidth error={!!errors.cpf}>
              <FormLabel id="label-cpf">CPF</FormLabel>
              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="000.000.000-00"
                    InputProps={{
                      inputComponent: MaskedInput as any,
                      inputProps: { mask: "000.000.000-00", name: field.name },
                    }}
                    error={!!errors.cpf}
                    helperText={errors.cpf?.message}
                  />
                )}
              />
            </FormControl>

            {/* Demais campos (data de nascimento, país, CEP, endereço, número, etc.) */}
            <FormControl fullWidth error={!!errors.data_nascimento}>
              <FormLabel id="label-data_nascimento">
                Data de Nascimento
              </FormLabel>
              <Controller
                name="data_nascimento"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    placeholder="dd/mm/aaaa"
                    InputProps={{
                      inputComponent: MaskedInput as any,
                      inputProps: { mask: "00/00/0000", name: field.name },
                    }}
                    error={!!errors.data_nascimento}
                    helperText={errors.data_nascimento?.message as string}
                  />
                )}
              />
            </FormControl>

            {/* <TextField
              inputRef={fieldRefs.pais}
              fullWidth
              label="País"
              placeholder="País"
              error={!!errors.pais}
              helperText={errors.pais?.message}
              {...register("pais")}
            /> */}

            {/* Seletor de Endereços para Cliente Logado */}
            {clienteLogado && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                  Endereço de Entrega
                </Typography>
                <EnderecoSelector 
                  clienteLogado={!!clienteLogado}
                  onEnderecoSelected={handleEnderecoSelecionado}
                />
              </Box>
            )}

            {!clienteLogado && (
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Endereço de Entrega
              </Typography>
            )}

            <FormControl fullWidth error={!!errors.cep}>
              <FormLabel id="label-cep">CEP</FormLabel>
              <Controller
                name="cep"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="00000-000"
                    InputProps={{
                      inputComponent: MaskedInput as any,
                      inputProps: { mask: "00000-000", name: field.name },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => {
                              const rawCep = field.value;
                              if (rawCep) buscarEnderecoPorCep(rawCep);
                            }}
                            edge="end"
                            size="small"
                          >
                            <FiSearch />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const value = (e.target as HTMLInputElement).value;
                        if (value) {
                          buscarEnderecoPorCep(value);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      field.onBlur();
                      buscarEnderecoPorCep(e.target.value);
                    }}
                    error={!!errors.cep}
                    helperText={errors.cep?.message}
                  />
                )}
              />
            </FormControl>

            {loadingCep && (
              <Typography variant="body2" color="textSecondary">
                Buscando endereço...
              </Typography>
            )}

            <TextField
              inputRef={fieldRefs.endereco}
              fullWidth
              label="Endereço"
              placeholder="Endereço"
              error={!!errors.endereco}
              helperText={errors.endereco?.message}
              InputLabelProps={{ shrink: true }}
              {...register("endereco")}
            />

            <TextField
              inputRef={fieldRefs.numero}
              fullWidth
              label="Número"
              placeholder="Número"
              error={!!errors.numero}
              helperText={errors.numero?.message}
              {...register("numero")}
            />

            <TextField
              fullWidth
              label="Complemento"
              placeholder="Complemento (opcional)"
              {...register("complemento")}
            />

            <TextField
              inputRef={fieldRefs.bairro}
              fullWidth
              label="Bairro"
              placeholder="Bairro"
              error={!!errors.bairro}
              helperText={errors.bairro?.message}
              InputLabelProps={{ shrink: true }}
              {...register("bairro")}
            />

            {/* <TextField
              inputRef={fieldRefs.cidade}
              fullWidth
              label="Cidade"
              placeholder="Cidade"
              error={!!errors.cidade}
              helperText={errors.cidade?.message}
              InputLabelProps={{ shrink: true }}
              {...register("cidade")}
            />

            <TextField
              inputRef={fieldRefs.estado}
              fullWidth
              label="Estado"
              placeholder="Estado"
              error={!!errors.estado}
              helperText={errors.estado?.message}
              InputLabelProps={{ shrink: true }}
              {...register("estado")}
            /> */}

            {/* <Controller
              name="salvar_minhas_informacoes"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Salvar minhas informações"
                />
              )}
            /> */}

            <Controller
              name="aceito_receber_whatsapp"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Aceito receber WhatsApp"
                />
              )}
            />

            <TextField
              fullWidth
              label="Destinatário (opcional)"
              placeholder="Destinatário"
              error={!!errors.destinatario}
              helperText={errors.destinatario?.message}
              {...register("destinatario")}
            />

            {/* Opção de criar conta - apenas para clientes não logados */}
            {!clienteLogado && (
              <Controller
                name="salvar_minhas_informacoes"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.checked);
                          setShowCreateAccount(e.target.checked);
                        }}
                      />
                    }
                    label="Criar conta com estes dados para facilitar futuras compras"
                    sx={{ 
                      bgcolor: 'rgba(25, 118, 210, 0.08)',
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid rgba(25, 118, 210, 0.2)'
                    }}
                  />
                )}
              />
            )}

            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#C0392B",
                "&:hover": { backgroundColor: "#A93226" },
              }}
            >
              Enviar Pedido{" "}
              {loading && (
                <CircularProgress
                  size={20}
                  style={{ color: "#fff", marginLeft: 8 }}
                />
              )}
            </Button>
          </Stack>
        </form>

        {/* Modal de Login Rápido */}
        <QuickLoginModal
          open={showQuickLogin}
          onClose={() => setShowQuickLogin(false)}
          onLoginSuccess={verificarClienteLogado}
        />
      </Box>
    </ThemeProvider>
  );
};

export default PedidoForm;

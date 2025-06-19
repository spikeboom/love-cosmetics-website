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
import { extractGaSessionData } from "@/utils/get-ga-cookie-info";
import { FiSearch } from "react-icons/fi";

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
  pais: z.string().nonempty("País é obrigatório"),
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

const PedidoForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { cart, total, descontos, cupons } = useMeuContexto();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PedidoFormData>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: defaultPedidoFormData,
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
    console.log("Dados do formulário:", data);
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
      }));

      const result = await postPedido({
        ...data,
        items: items,
        cupons: cupons?.map((c: any) => c.codigo),
        descontos: Math.trunc(descontos * 100),
        total_pedido: total,
        ...extractGaSessionData("G-SXLFK0Y830"),
      });

      console.log("Resposta da API:", result);

      // Caso a API retorne erro, exibe as mensagens específicas usando notistack
      if (result.error) {
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
        ...extractGaSessionData("G-SXLFK0Y830"),
      });

      // add snackbar redirecting to payment link
      enqueueSnackbar("Redirecionando para o pagamento...", {
        variant: "success",
      });

      // Se tudo ocorrer bem, redireciona para o link de pagamento
      window.location.href = result?.link;
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

  if (loadingFormData) {
    return <div>Carregando...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 800, margin: "auto", padding: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Formulário de Pedido
        </Typography>
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
      </Box>
    </ThemeProvider>
  );
};

export default PedidoForm;

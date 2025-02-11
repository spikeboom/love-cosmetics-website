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
  Snackbar,
  Alert,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { postPedido } from "@/modules/pedido/domain";
import { useMeuContexto } from "@/components/context/context";
import MaskedInput from "./MaskedInput";

// Definição do schema com zod
const pedidoSchema = z.object({
  nome: z.string().nonempty("O nome é obrigatório"),
  sobrenome: z.string().nonempty("O sobrenome é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().nonempty("Telefone é obrigatório"),
  cpf: z.string().nonempty("CPF é obrigatório"),
  data_nascimento: z.preprocess(
    (arg) => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    },
    z.date({ required_error: "Data de nascimento é obrigatória" }),
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
  total_pedido?: number;
};

// Dados iniciais do formulário
const defaultPedidoFormData: PedidoFormData = {
  nome: "",
  sobrenome: "",
  email: "",
  telefone: "",
  cpf: "",
  data_nascimento: new Date(),
  pais: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  salvar_minhas_informacoes: false,
  aceito_receber_whatsapp: false,
  destinatario: "",
};

const PedidoForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { cart, total } = useMeuContexto();

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

  // Estado para os snackbars (toasts)
  const [snackbars, setSnackbars] = useState<
    Array<{ id: number; message: string }>
  >([]);

  const addSnackbar = (message: string) => {
    setSnackbars((prev) => [...prev, { id: Date.now(), message }]);
  };

  const handleCloseSnackbar = (id: number) => {
    setSnackbars((prev) => prev.filter((snack) => snack.id !== id));
  };

  async function onSubmit(data: PedidoFormData) {
    setLoading(true);
    console.log("Dados do formulário:", data);

    try {
      const items: any[] = Object.entries(cart).map(([id, product]: any) => ({
        reference_id: id,
        name: product.nome,
        quantity: product.quantity,
        unit_amount: Math.trunc(product.preco * 100),
        image_url:
          process.env.NEXT_PUBLIC_STRAPI_URL +
          product.carouselImagensPrincipal?.[0]?.imagem?.formats?.medium?.url,
      }));

      const result = await postPedido({
        ...data,
        items: items,
        total_pedido: total,
      });

      console.log("Resposta da API:", result);

      // Caso a API retorne erro, exiba os toasts específicos
      if (result.error) {
        const errorMessages = result.details?.error_messages;
        if (Array.isArray(errorMessages)) {
          errorMessages.forEach((err: any) => {
            if (err.parameter_name === "customer.tax_id") {
              addSnackbar(
                "CPF inválido. Verifique se o CPF possui 11 dígitos.",
              );
            }
            if (err.parameter_name === "customer.phone.number") {
              addSnackbar(
                "Telefone inválido. Verifique se o telefone possui o número correto de dígitos.",
              );
            }
          });
        } else {
          addSnackbar("Erro ao processar o pagamento.");
        }
        setLoading(false);
        return;
      }

      // Se tudo ocorrer bem, redireciona para o link de pagamento
      window.location.href = result?.link;
    } catch (error) {
      console.error("Erro:", error);
      addSnackbar("Erro ao enviar o pedido.");
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
      Object.keys(parsedData).forEach((key) => {
        setValue(
          key as keyof PedidoFormData,
          parsedData[key as keyof PedidoFormData],
        );
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
      };
      saveToLocalStorage(completeData);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  if (loadingFormData) {
    return <div>Carregando...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 800, margin: "auto", padding: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Formulário de Pedido
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            {/* Campos do formulário (nome, sobrenome, email, etc.) */}
            <TextField
              fullWidth
              label="Nome"
              placeholder="Seu nome"
              error={!!errors.nome}
              helperText={errors.nome?.message}
              {...register("nome")}
            />
            <TextField
              fullWidth
              label="Sobrenome"
              placeholder="Seu sobrenome"
              error={!!errors.sobrenome}
              helperText={errors.sobrenome?.message}
              {...register("sobrenome")}
            />
            <TextField
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
              <FormLabel>Telefone</FormLabel>
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
                      inputProps: { mask: "(00) 00000-0000", name: field.name },
                    }}
                    error={!!errors.telefone}
                    helperText={errors.telefone?.message}
                  />
                )}
              />
              {errors.telefone && (
                <Typography variant="caption" color="error">
                  {errors.telefone.message}
                </Typography>
              )}
            </FormControl>

            {/* CPF com máscara */}
            <FormControl fullWidth error={!!errors.cpf}>
              <FormLabel>CPF</FormLabel>
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
              {errors.cpf && (
                <Typography variant="caption" color="error">
                  {errors.cpf.message}
                </Typography>
              )}
            </FormControl>

            {/* Demais campos (data de nascimento, país, CEP, endereço, número, etc.) */}
            <TextField
              fullWidth
              label="Data de Nascimento"
              type="date"
              InputLabelProps={{ shrink: true }}
              error={!!errors.data_nascimento}
              helperText={errors.data_nascimento?.message as string}
              {...register("data_nascimento")}
            />
            <TextField
              fullWidth
              label="País"
              placeholder="País"
              error={!!errors.pais}
              helperText={errors.pais?.message}
              {...register("pais")}
            />
            <FormControl fullWidth error={!!errors.cep}>
              <FormLabel>CEP</FormLabel>
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
                    }}
                    error={!!errors.cep}
                    helperText={errors.cep?.message}
                  />
                )}
              />
              {errors.cep && (
                <Typography variant="caption" color="error">
                  {errors.cep.message}
                </Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="Endereço"
              placeholder="Endereço"
              error={!!errors.endereco}
              helperText={errors.endereco?.message}
              {...register("endereco")}
            />
            <TextField
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
              fullWidth
              label="Bairro"
              placeholder="Bairro"
              error={!!errors.bairro}
              helperText={errors.bairro?.message}
              {...register("bairro")}
            />
            <TextField
              fullWidth
              label="Cidade"
              placeholder="Cidade"
              error={!!errors.cidade}
              helperText={errors.cidade?.message}
              {...register("cidade")}
            />
            <TextField
              fullWidth
              label="Estado"
              placeholder="Estado"
              error={!!errors.estado}
              helperText={errors.estado?.message}
              {...register("estado")}
            />

            <Controller
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
            />
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

            <Button type="submit" variant="contained" color="primary">
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

      {/* Renderiza os Snackbars para os toasts */}
      {snackbars.map((snack) => (
        <Snackbar
          key={snack.id}
          open={true}
          autoHideDuration={6000}
          onClose={() => handleCloseSnackbar(snack.id)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => handleCloseSnackbar(snack.id)}
            severity="error"
            sx={{ width: "100%" }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      ))}
    </ThemeProvider>
  );
};

export default PedidoForm;

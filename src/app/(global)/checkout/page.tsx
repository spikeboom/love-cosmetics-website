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
  FormLabel,
  Input,
  Stack,
  Text,
  Heading,
  ChakraProvider,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { postPedido } from "@/modules/pedido/domain";
import { useMeuContexto } from "@/components/context/context";

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
export type PedidoFormData = z.infer<typeof pedidoSchema> & { items?: any[] };

/**
 * Função que aplica a máscara.
 * O caractere "9" no mask representa um dígito.
 * Todos os outros caracteres são literais.
 */
function applyMask(value: string, mask: string): string {
  // Remove qualquer caractere que não seja dígito
  const digits = value.replace(/\D/g, "");

  // Se não houver dígitos, retorna string vazia
  if (digits.length === 0) return "";

  let result = "";
  let digitIndex = 0;

  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === "9") {
      if (digitIndex < digits.length) {
        result += digits[digitIndex++];
      } else {
        break;
      }
    } else {
      result += mask[i];
    }
  }

  return result;
}

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: string;
  value?: string;
  onChange?: (event: { target: { value: string } }) => void;
}

/**
 * Componente customizado para inputs com máscara.
 * Ele utiliza a função applyMask para formatar o valor conforme o padrão.
 */
const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, onChange, value, ...rest }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "");
      if (onChange) {
        onChange({ target: { value: rawValue } });
      }
    };

    return (
      // @ts-ignore
      <Input
        ref={ref}
        value={applyMask(value || "", mask)}
        onChange={handleChange}
        {...rest}
      />
    );
  },
);
MaskedInput.displayName = "MaskedInput";

// Defina esse objeto uma vez, por exemplo, acima do componente PedidoForm
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

  const toast = useToast();

  // 🔹 Função para salvar no localStorage sempre que houver mudanças
  const saveToLocalStorage = (data: PedidoFormData) => {
    localStorage.setItem("formulario_pedido", JSON.stringify(data));
  };

  // 🔹 Recuperar dados do localStorage ao carregar a página
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
  }, [setValue]);

  // 🔹 Atualizar localStorage automaticamente ao mudar um campo
  useEffect(() => {
    const subscription = watch((data) => {
      // Mescla os dados atuais com os valores padrão para garantir que todos os campos estejam presentes
      const completeData: PedidoFormData = {
        ...defaultPedidoFormData,
        ...data,
      };
      saveToLocalStorage(completeData);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  async function onSubmit(data: PedidoFormData) {
    setLoading(true);
    console.log("Dados do formulário:", data);

    try {
      console.log({ cart });
      const items: any[] = Object.entries(cart).map(([id, product]: any) => ({
        reference_id: id,
        name: product.nome,
        quantity: product.quantity,
        unit_amount: Math.trunc(product.preco * 100),
        image_url:
          process.env.NEXT_PUBLIC_STRAPI_URL +
          product.carouselImagensPrincipal?.[0]?.imagem?.formats?.medium?.url,
      }));
      console.log({ items });
      const result = await postPedido({ ...data, items: items });
      console.log("Resposta da API:", result);

      window.location.href = result?.link;
    } catch (error) {
      console.error("Erro:", error);
    }
    setLoading(false);
  }

  return (
    <ChakraProvider>
      <Box maxW="800px" mx="auto" p={8}>
        <Heading mb={6}>Formulário de Pedido</Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            {/* Nome */}
            <FormControl isInvalid={!!errors.nome}>
              <FormLabel>Nome</FormLabel>
              <Input placeholder="Seu nome" {...register("nome")} />
              {errors.nome && (
                <Text color="red.500">{errors.nome.message}</Text>
              )}
            </FormControl>

            {/* Sobrenome */}
            <FormControl isInvalid={!!errors.sobrenome}>
              <FormLabel>Sobrenome</FormLabel>
              <Input placeholder="Seu sobrenome" {...register("sobrenome")} />
              {errors.sobrenome && (
                <Text color="red.500">{errors.sobrenome.message}</Text>
              )}
            </FormControl>

            {/* Email */}
            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="seuemail@exemplo.com"
                {...register("email")}
              />
              {errors.email && (
                <Text color="red.500">{errors.email.message}</Text>
              )}
            </FormControl>

            {/* Telefone com máscara usando Controller */}
            <FormControl isInvalid={!!errors.telefone}>
              <FormLabel>Telefone</FormLabel>
              <Controller
                name="telefone"
                control={control}
                render={({ field }) => (
                  <MaskedInput
                    mask="(99) 99999-9999"
                    placeholder="(00) 00000-0000"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.telefone && (
                <Text color="red.500">{errors.telefone.message}</Text>
              )}
            </FormControl>

            {/* CPF com máscara usando Controller */}
            <FormControl isInvalid={!!errors.cpf}>
              <FormLabel>CPF</FormLabel>
              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <MaskedInput
                    mask="999.999.999-99"
                    placeholder="000.000.000-00"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.cpf && <Text color="red.500">{errors.cpf.message}</Text>}
            </FormControl>

            {/* Data de Nascimento */}
            <FormControl isInvalid={!!errors.data_nascimento}>
              <FormLabel>Data de Nascimento</FormLabel>
              <Input type="date" {...register("data_nascimento")} />
              {errors.data_nascimento && (
                <Text color="red.500">
                  {errors.data_nascimento.message as string}
                </Text>
              )}
            </FormControl>

            {/* País */}
            <FormControl isInvalid={!!errors.pais}>
              <FormLabel>País</FormLabel>
              <Input placeholder="País" {...register("pais")} />
              {errors.pais && (
                <Text color="red.500">{errors.pais.message}</Text>
              )}
            </FormControl>

            {/* CEP com máscara usando Controller */}
            <FormControl isInvalid={!!errors.cep}>
              <FormLabel>CEP</FormLabel>
              <Controller
                name="cep"
                control={control}
                render={({ field }) => (
                  <MaskedInput
                    mask="99999-999"
                    placeholder="00000-000"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.cep && <Text color="red.500">{errors.cep.message}</Text>}
            </FormControl>

            {/* Endereço */}
            <FormControl isInvalid={!!errors.endereco}>
              <FormLabel>Endereço</FormLabel>
              <Input placeholder="Endereço" {...register("endereco")} />
              {errors.endereco && (
                <Text color="red.500">{errors.endereco.message}</Text>
              )}
            </FormControl>

            {/* Número */}
            <FormControl isInvalid={!!errors.numero}>
              <FormLabel>Número</FormLabel>
              <Input placeholder="Número" {...register("numero")} />
              {errors.numero && (
                <Text color="red.500">{errors.numero.message}</Text>
              )}
            </FormControl>

            {/* Complemento (opcional) */}
            <FormControl>
              <FormLabel>Complemento</FormLabel>
              <Input
                placeholder="Complemento (opcional)"
                {...register("complemento")}
              />
            </FormControl>

            {/* Bairro */}
            <FormControl isInvalid={!!errors.bairro}>
              <FormLabel>Bairro</FormLabel>
              <Input placeholder="Bairro" {...register("bairro")} />
              {errors.bairro && (
                <Text color="red.500">{errors.bairro.message}</Text>
              )}
            </FormControl>

            {/* Cidade */}
            <FormControl isInvalid={!!errors.cidade}>
              <FormLabel>Cidade</FormLabel>
              <Input placeholder="Cidade" {...register("cidade")} />
              {errors.cidade && (
                <Text color="red.500">{errors.cidade.message}</Text>
              )}
            </FormControl>

            {/* Estado */}
            <FormControl isInvalid={!!errors.estado}>
              <FormLabel>Estado</FormLabel>
              <Input placeholder="Estado" {...register("estado")} />
              {errors.estado && (
                <Text color="red.500">{errors.estado.message}</Text>
              )}
            </FormControl>

            {/* Checkbox: Salvar minhas informações usando Controller */}
            <FormControl>
              <Controller
                name="salvar_minhas_informacoes"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    isChecked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    Salvar minhas informações
                  </Checkbox>
                )}
              />
            </FormControl>

            {/* Checkbox: Aceito receber WhatsApp usando Controller */}
            <FormControl>
              <Controller
                name="aceito_receber_whatsapp"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    isChecked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    Aceito receber WhatsApp
                  </Checkbox>
                )}
              />
            </FormControl>

            {/* Destinatário (opcional) */}
            <FormControl isInvalid={!!errors.destinatario}>
              <FormLabel>Destinatário (opcional)</FormLabel>
              <Input placeholder="Destinatário" {...register("destinatario")} />
              {errors.destinatario && (
                <Text color="red.500">{errors.destinatario.message}</Text>
              )}
            </FormControl>

            {/* Botão de submit */}
            <Button colorScheme="blue" type="submit">
              Enviar Pedido {loading && <Spinner className="ml-4" />}
            </Button>
          </Stack>
        </form>
      </Box>
    </ChakraProvider>
  );
};

export default PedidoForm;

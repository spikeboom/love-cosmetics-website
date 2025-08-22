"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  CircularProgress,
  IconButton,
  Alert,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "notistack";
import { useAuth } from "@/contexts/AuthContext";
import { createCloseAction } from "@/utils/snackbar-helpers";

// Schema de validação para login rápido
const quickLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type QuickLoginData = z.infer<typeof quickLoginSchema>;

interface QuickLoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

/**
 * Modal de login rápido para o checkout
 * Permite que o cliente faça login sem sair da página de checkout
 * Integra com o sistema de autenticação existente
 */
const QuickLoginModal: React.FC<QuickLoginModalProps> = ({
  open,
  onClose,
  onLoginSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { checkAuth } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuickLoginData>({
    resolver: zodResolver(quickLoginSchema),
  });

  /**
   * Processa o login do cliente
   * Usa a API existente de autenticação em /api/cliente/auth/entrar
   */
  const onSubmit = async (data: QuickLoginData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/cliente/auth/entrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Atualizar o AuthContext global
        await checkAuth();
        
        enqueueSnackbar("Login realizado com sucesso!", {
          variant: "success",
          action: createCloseAction
        });
        reset();
        onClose();
        onLoginSuccess(); // Chama função para atualizar o formulário principal
      } else {
        enqueueSnackbar(
          result.message || "Erro ao fazer login. Verifique suas credenciais.",
          { variant: "error" }
        );
      }
    } catch (error) {
      console.error("Erro no login:", error);
      enqueueSnackbar("Erro de conexão. Tente novamente.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fecha o modal e reseta o formulário
   */
  const handleClose = () => {
    reset();
    setShowCreateAccount(false);
    onClose();
  };

  /**
   * Navega para a página de cadastro
   * Abre em nova aba para não perder o carrinho
   */
  const handleGoToRegister = () => {
    window.open("/conta/cadastrar", "_blank");
    handleClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          maxHeight: '90vh' 
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          Entrar na sua conta
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Preencha automaticamente seus dados
        </Typography>
        <IconButton
          aria-label="fechar"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            {/* Informação sobre benefícios do login */}
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Vantagens do login:</strong>
                <br />
                • Dados preenchidos automaticamente
                <br />
                • Histórico de pedidos
                <br />
                • Cupons exclusivos
              </Typography>
            </Alert>

            <TextField
              fullWidth
              label="Email"
              type="email"
              placeholder="seu@email.com"
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={loading}
              {...register("email")}
            />

            <TextField
              fullWidth
              label="Senha"
              type="password"
              placeholder="Sua senha"
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loading}
              {...register("password")}
            />

            {/* Link para recuperar senha */}
            <Typography variant="body2" sx={{ textAlign: "center" }}>
              <Link 
                href="/conta/esqueci-senha" 
                target="_blank"
                sx={{ textDecoration: "none" }}
              >
                Esqueceu sua senha?
              </Link>
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Stack spacing={2} sx={{ width: "100%" }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                backgroundColor: "#C0392B",
                "&:hover": { backgroundColor: "#A93226" },
                py: 1.5,
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Entrar"
              )}
            </Button>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ textAlign: "center" }}
            >
              Não tem conta?{" "}
              <Link
                component="button"
                type="button"
                onClick={handleGoToRegister}
                sx={{ textDecoration: "none" }}
              >
                Cadastre-se aqui
              </Link>
            </Typography>
          </Stack>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default QuickLoginModal;
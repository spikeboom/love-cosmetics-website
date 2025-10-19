"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import { LuShoppingCart, LuTruck, LuTag, LuDollarSign } from "react-icons/lu";

interface OrderSummaryProps {
  cart: any;
  freight: {
    freightValue: number;
    deliveryTime: string;
    hasCalculated: boolean;
  };
  descontos: number;
  cupons: any[];
  total: number;
}

export function OrderSummary({
  cart,
  freight,
  descontos,
  cupons,
  total,
}: OrderSummaryProps) {
  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce(
    (acc: number, item: any) => acc + item.preco * item.quantity,
    0
  );

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card
      elevation={3}
      sx={{
        position: { xs: "relative", md: "sticky" },
        top: { md: 100 },
        height: "fit-content",
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Resumo do Pedido
        </Typography>

        {/* Itens do Carrinho */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <LuShoppingCart size={18} />
            <Typography variant="subtitle2" fontWeight={600}>
              Itens ({cartItems.length})
            </Typography>
          </Box>

          <Stack spacing={1} sx={{ mb: 2 }}>
            {cartItems.map((item: any) => (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  pl: 1,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                    {item.quantity}x {item.nome}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, fontSize: "0.875rem", ml: 1 }}
                >
                  {formatPrice(item.preco * item.quantity)}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              pl: 1,
              pt: 1,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" fontWeight={500}>
              Subtotal
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatPrice(subtotal)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Frete */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <LuTruck size={18} />
            <Typography variant="subtitle2" fontWeight={600}>
              Frete
            </Typography>
          </Box>

          {freight.hasCalculated ? (
            <Box sx={{ pl: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {freight.deliveryTime}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatPrice(freight.freightValue)}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography
              variant="body2"
              color="warning.main"
              sx={{ pl: 1, fontSize: "0.875rem" }}
            >
              Calcule o frete no carrinho
            </Typography>
          )}
        </Box>

        {/* Cupons e Descontos */}
        {cupons && cupons.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <LuTag size={18} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Cupons
                </Typography>
              </Box>

              <Stack spacing={1} sx={{ pl: 1 }}>
                {cupons.map((cupom: any, index: number) => (
                  <Box key={index}>
                    <Chip
                      label={cupom.codigo}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontSize: "0.75rem" }}
                    />
                  </Box>
                ))}
              </Stack>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  pl: 1,
                  mt: 1,
                }}
              >
                <Typography variant="body2" color="success.main" fontWeight={500}>
                  Desconto
                </Typography>
                <Typography variant="body2" color="success.main" fontWeight={600}>
                  -{formatPrice(descontos)}
                </Typography>
              </Box>
            </Box>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Total */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "primary.main",
            color: "white",
            p: 2,
            borderRadius: 1,
            mt: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LuDollarSign size={20} />
            <Typography variant="h6" fontWeight={700}>
              Total
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight={700}>
            {formatPrice(total)}
          </Typography>
        </Box>

        {!freight.hasCalculated && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1, textAlign: "center" }}
          >
            * O frete será calculado no carrinho
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Button,
  Link as MuiLink
} from '@mui/material';
import { MapPin, Plus } from 'lucide-react';

interface Endereco {
  id: string;
  apelido: string;
  principal: boolean;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  destinatario?: string;
  telefone?: string;
}

interface EnderecoSelectorProps {
  onEnderecoSelected: (endereco: Endereco | null) => void;
  clienteLogado: boolean;
}

const EnderecoSelector: React.FC<EnderecoSelectorProps> = ({ 
  onEnderecoSelected, 
  clienteLogado 
}) => {
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clienteLogado) {
      buscarEnderecos();
    }
  }, [clienteLogado]);

  const buscarEnderecos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cliente/enderecos/checkout');
      if (response.ok) {
        const data = await response.json();
        setEnderecos(data.enderecos || []);
        
        // Auto-selecionar endereço principal ou primeiro
        if (data.enderecoPrincipal) {
          setEnderecoSelecionado(data.enderecoPrincipal.id);
          onEnderecoSelected(data.enderecoPrincipal);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnderecoChange = (enderecoId: string) => {
    setEnderecoSelecionado(enderecoId);
    
    if (enderecoId === 'novo') {
      onEnderecoSelected(null);
      return;
    }

    const endereco = enderecos.find(e => e.id === enderecoId);
    onEnderecoSelected(endereco || null);
  };

  if (!clienteLogado) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Carregando endereços...
        </Typography>
      </Box>
    );
  }

  if (enderecos.length === 0) {
    return (
      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Nenhum endereço cadastrado.
        </Typography>
        <MuiLink 
          href="/minha-conta/enderecos" 
          target="_blank"
          sx={{ fontSize: '0.875rem' }}
        >
          Cadastrar endereço
        </MuiLink>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Usar endereço cadastrado</InputLabel>
        <Select
          value={enderecoSelecionado}
          label="Usar endereço cadastrado"
          onChange={(e) => handleEnderecoChange(e.target.value)}
        >
          {enderecos.map((endereco) => (
            <MenuItem key={endereco.id} value={endereco.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <MapPin size={16} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {endereco.apelido}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {endereco.endereco}, {endereco.numero} - {endereco.bairro}
                  </Typography>
                </Box>
                {endereco.principal && (
                  <Chip 
                    label="Principal" 
                    size="small" 
                    color="primary"
                    sx={{ fontSize: '0.75rem', height: '20px' }}
                  />
                )}
              </Box>
            </MenuItem>
          ))}
          <MenuItem value="novo">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Plus size={16} />
              <Typography variant="body2">
                Usar novo endereço
              </Typography>
            </Box>
          </MenuItem>
        </Select>
      </FormControl>

      {enderecoSelecionado && enderecoSelecionado !== 'novo' && (
        <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1, border: 1, borderColor: 'primary.200' }}>
          {(() => {
            const endereco = enderecos.find(e => e.id === enderecoSelecionado);
            if (!endereco) return null;
            
            return (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {endereco.apelido}
                  </Typography>
                  {endereco.principal && (
                    <Chip 
                      label="Principal" 
                      size="small" 
                      color="primary"
                      sx={{ fontSize: '0.75rem', height: '18px' }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {endereco.endereco}, {endereco.numero}
                  {endereco.complemento && ` - ${endereco.complemento}`}
                  <br />
                  {endereco.bairro} - {endereco.cidade}/{endereco.estado}
                  <br />
                  CEP: {endereco.cep}
                </Typography>
                {endereco.destinatario && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Destinatário: {endereco.destinatario}
                  </Typography>
                )}
              </Box>
            );
          })()}
        </Box>
      )}

      <Box sx={{ mt: 1, textAlign: 'center' }}>
        <MuiLink 
          href="/minha-conta/enderecos" 
          target="_blank"
          sx={{ fontSize: '0.875rem' }}
        >
          Gerenciar endereços
        </MuiLink>
      </Box>
    </Box>
  );
};

export default EnderecoSelector;
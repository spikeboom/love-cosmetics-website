-- Cria o índice para otimizar as consultas que filtram por info->>'reference_id'
CREATE INDEX idx_status_pagamento_reference_id 
  ON "StatusPagamento" ((info->>'reference_id'));

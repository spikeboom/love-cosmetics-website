interface PendingIconProps {
  className?: string;
}

/**
 * Icone de pendente (circulo vazio)
 * Usado em: timeline de status de pedidos para etapas nao concluidas
 */
export function PendingIcon({ className }: PendingIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );
}

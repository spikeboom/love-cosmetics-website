export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
    'PAID': { label: 'Pago', bgColor: 'bg-[#F0F9F4]', textColor: 'text-[#009142]', borderColor: 'border-[#009142]' },
    'IN_ANALYSIS': { label: 'Em Analise', bgColor: 'bg-[#FFF8E6]', textColor: 'text-[#ba7900]', borderColor: 'border-[#ba7900]' },
    'FAILED': { label: 'Falhou', bgColor: 'bg-red-50', textColor: 'text-[#B3261E]', borderColor: 'border-[#B3261E]' },
    'CANCELLED': { label: 'Cancelado', bgColor: 'bg-red-50', textColor: 'text-[#B3261E]', borderColor: 'border-[#B3261E]' },
    'WAITING_PAYMENT': { label: 'Aguardando', bgColor: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-600' },
    'CORTESIA': { label: 'Cortesia', bgColor: 'bg-purple-50', textColor: 'text-purple-600', borderColor: 'border-purple-600' },
  };

  const config = statusMap[status] || { label: status, bgColor: 'bg-gray-100', textColor: 'text-[#666666]', borderColor: 'border-[#d2d2d2]' };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-[4px] border ${config.bgColor} ${config.textColor} ${config.borderColor} font-cera-pro font-light text-[12px]`}>
      {config.label}
    </span>
  );
}

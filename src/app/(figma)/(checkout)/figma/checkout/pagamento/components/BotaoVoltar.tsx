interface BotaoVoltarProps {
  onClick: () => void;
}

export function BotaoVoltar({ onClick }: BotaoVoltarProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-[#254333] hover:opacity-80 transition-opacity self-start"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 18L9 12L15 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-cera-pro font-light text-[16px]">Voltar</span>
    </button>
  );
}

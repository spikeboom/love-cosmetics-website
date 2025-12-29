export function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#254333] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-cera-pro text-[16px] text-[#333333]">
        Verificando pedido...
      </p>
    </div>
  );
}

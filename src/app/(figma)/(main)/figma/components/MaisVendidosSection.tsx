import { VitrineSection } from "./VitrineSection";

interface MaisVendidosSectionProps {
  produtos?: any[];
}

export function MaisVendidosSection({ produtos = [] }: MaisVendidosSectionProps) {
  return (
    <VitrineSection
      titulo="Mais vendidos"
      subtitulo="Produtos que estão fazendo sucesso"
      backgroundColor="cream"
      showNavigation={false}
      showVerTodos={false}
      tipo="produto-completo"
      showIconeTitulo={false}
      showRanking={true}
      produtos={produtos}
    />
  );
}

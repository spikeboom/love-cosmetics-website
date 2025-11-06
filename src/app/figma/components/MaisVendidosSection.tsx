import { VitrineSection } from "./VitrineSection";

interface MaisVendidosSectionProps {
  produtos?: any[];
}

export function MaisVendidosSection({ produtos = [] }: MaisVendidosSectionProps) {
  // Dados mockados para fallback quando não houver produtos do Strapi
  const produtosMockados = [
    {
      imagem: "/new-home/produtos/produto-1.png",
      nome: "Manteiga Corporal Lové Cosméticos",
      desconto: "40% OFF",
      preco: 99.99,
      precoOriginal: 129.99,
      parcelas: "3x R$33,33 sem juros",
      rating: 3.5,
      ultimasUnidades: true,
    },
    {
      imagem: "/new-home/produtos/produto-2.png",
      nome: "Máscara de Argila Lové Cosméticos",
      desconto: "15% OFF",
      preco: 89.99,
      precoOriginal: 105.99,
      parcelas: "3x R$29,99 sem juros",
      rating: 4.0,
    },
    {
      imagem: "/new-home/produtos/produto-3.png",
      nome: "Sérum Facial Lové Cosméticos",
      desconto: "15% OFF",
      preco: 119.99,
      precoOriginal: 140.99,
      parcelas: "3x R$39,99 sem juros",
      rating: 4.5,
      ultimasUnidades: true,
    },
    {
      imagem: "/new-home/produtos/produto-2.png",
      nome: "Máscara de Argila Lové Cosméticos",
      desconto: "15% OFF",
      preco: 89.99,
      precoOriginal: 105.99,
      parcelas: "3x R$29,99 sem juros",
      rating: 3.5,
    },
    {
      imagem: "/new-home/produtos/produto-1.png",
      nome: "Manteiga Corporal Lové Cosméticos",
      desconto: "40% OFF",
      preco: 99.99,
      precoOriginal: 129.99,
      parcelas: "3x R$33,33 sem juros",
      rating: 5.0,
    },
  ];

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
      produtos={produtos.length > 0 ? produtos : produtosMockados}
    />
  );
}

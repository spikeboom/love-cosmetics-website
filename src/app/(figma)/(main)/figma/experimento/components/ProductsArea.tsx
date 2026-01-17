import { CardProduto } from "./CardProduto";

interface ProductsAreaProps {
  columns?: number;
  rows?: number;
}

const mockProdutos = [
  {
    imagem: "/new-home/produtos/produto-1.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "A manteiga corporal hidrata profundamente, alivia inflamações e rachaduras, fortalece a barreira da pele e proporciona maciez imediata. Ideal para peles ressecadas.",
    precoOriginal: "R$ 129,99",
    preco: "R$ 99,99",
    desconto: "40% OFF",
    parcelas: "3x R$33,33 sem juros",
    rating: 3.5,
    ultimasUnidades: true,
  },
  {
    imagem: "/new-home/produtos/produto-2.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Formulação enriquecida com manteigas naturais e óleos essenciais. Proporciona hidratação duradoura e deixa a pele macia.",
    precoOriginal: "R$ 105,99",
    preco: "R$ 89,99",
    desconto: "15% OFF",
    parcelas: "3x R$29,99 sem juros",
    rating: 4,
    ultimasUnidades: false,
  },
  {
    imagem: "/new-home/produtos/produto-3.png",
    nome: "Manteiga Corporal Lové Cosméticos",
    descricao: "Com ingredientes ativos da Amazônia que regeneram a pele. Reduz inflamações, alivia coceira e proporciona conforto imediato.",
    precoOriginal: "R$ 140,99",
    preco: "R$ 119,99",
    desconto: "15% OFF",
    parcelas: "3x R$39,99 sem juros",
    rating: 5,
    ultimasUnidades: true,
  },
];

export function ProductsArea({ columns = 3, rows = 4 }: ProductsAreaProps) {
  const totalItems = columns * rows;

  return (
    <div
      className="gap-[16px] grid grid-cols-[repeat(3,minmax(0,1fr))] auto-rows-fr shrink-0 w-[1172px]"
      data-name="1.3.2.1 Frame 2608671 / ProductsGrid"
    >
      {Array.from({ length: totalItems }).map((_, index) => {
        const produto = mockProdutos[index % mockProdutos.length];
        return (
          <CardProduto
            key={index}
            imagem={produto.imagem}
            nome={produto.nome}
            descricao={produto.descricao}
            precoOriginal={produto.precoOriginal}
            preco={produto.preco}
            desconto={produto.desconto}
            parcelas={produto.parcelas}
            rating={produto.rating}
            ultimasUnidades={produto.ultimasUnidades}
          />
        );
      })}
    </div>
  );
}

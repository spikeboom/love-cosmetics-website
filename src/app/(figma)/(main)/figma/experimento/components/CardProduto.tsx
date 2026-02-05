interface CardProdutoProps {
  imagem?: string;
  nome?: string;
  descricao?: string;
  precoOriginal?: string;
  preco?: string;
  desconto?: string;
  parcelas?: string;
  rating?: number;
  ultimasUnidades?: boolean;
}

// SVG estrela cheia
const StarFilled = () => (
  <svg
    className="block max-w-none size-full"
    viewBox="0 0 14.9408 15.0281"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.34541 14.925C3.17875 15.0583 3.00375 15.0623 2.82041 14.937C2.63708 14.8123 2.57875 14.65 2.64541 14.45L4.19541 9.325L0.195414 6.45C0.0120802 6.33333 -0.0422532 6.16667 0.0324134 5.95C0.107747 5.73333 0.253747 5.625 0.470414 5.625H5.44541L7.04541 0.325C7.07875 0.208333 7.13308 0.125 7.20841 0.0749998C7.28308 0.0249998 7.37041 0 7.47041 0C7.57041 0 7.65775 0.0249998 7.73241 0.0749998C7.80775 0.125 7.86208 0.208333 7.89541 0.325L9.49541 5.625H14.4704C14.6871 5.625 14.8331 5.73333 14.9084 5.95C14.9831 6.16667 14.9287 6.33333 14.7454 6.45L10.7454 9.325L12.2954 14.45C12.3621 14.65 12.3037 14.8123 12.1204 14.937C11.9371 15.0623 11.7621 15.0583 11.5954 14.925L7.47041 11.8L3.34541 14.925Z"
      fill="#F5B100"
    />
  </svg>
);

// SVG estrela meia
const StarHalf = () => (
  <svg
    className="block max-w-none size-full"
    viewBox="0 0 14.9408 15.0281"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.82041 14.937C3.00375 15.0623 3.17875 15.0583 3.34541 14.925L7.47041 11.8L11.5954 14.925C11.7621 15.0583 11.9371 15.0623 12.1204 14.937C12.3037 14.8123 12.3621 14.65 12.2954 14.45L10.7454 9.325L14.7454 6.45C14.9287 6.33333 14.9831 6.16667 14.9084 5.95C14.8331 5.73333 14.6871 5.625 14.4704 5.625H9.49541L7.89541 0.325C7.86208 0.208333 7.80775 0.125 7.73241 0.0749998C7.65775 0.0249998 7.57041 0 7.47041 0C7.37041 0 7.28308 0.0249998 7.20841 0.0749998C7.13308 0.125 7.07875 0.208333 7.04541 0.325L5.44541 5.625H0.470414C0.253747 5.625 0.107747 5.73333 0.0324134 5.95C-0.0422532 6.16667 0.0120802 6.33333 0.195414 6.45L4.19541 9.325L2.64541 14.45C2.57875 14.65 2.63708 14.8123 2.82041 14.937ZM7.5 9.94781L9.87041 11.775L8.97041 8.725L11.2204 7.125H8.42041L7.5 4.12154V9.94781Z"
      fill="#F5B100"
    />
  </svg>
);

// SVG estrela vazia
const StarEmpty = () => (
  <svg
    className="block max-w-none size-full"
    viewBox="0 0 14.9408 15.0281"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.34541 14.925C3.17875 15.0583 3.00375 15.0623 2.82041 14.937C2.63708 14.8123 2.57875 14.65 2.64541 14.45L4.19541 9.325L0.195414 6.45C0.0120802 6.33333 -0.0422532 6.16667 0.0324134 5.95C0.107747 5.73333 0.253747 5.625 0.470414 5.625H5.44541L7.04541 0.325C7.07875 0.208333 7.13308 0.125 7.20841 0.0749998C7.28308 0.0249998 7.37041 0 7.47041 0C7.57041 0 7.65775 0.0249998 7.73241 0.0749998C7.80775 0.125 7.86208 0.208333 7.89541 0.325L9.49541 5.625H14.4704C14.6871 5.625 14.8331 5.73333 14.9084 5.95C14.9831 6.16667 14.9287 6.33333 14.7454 6.45L10.7454 9.325L12.2954 14.45C12.3621 14.65 12.3037 14.8123 12.1204 14.937C11.9371 15.0623 11.7621 15.0583 11.5954 14.925L7.47041 11.8L3.34541 14.925ZM5.07041 11.775L7.47041 9.925L9.87041 11.775L8.97041 8.725L11.2204 7.125H8.42041L7.47041 4.025L6.52041 7.125H3.72041L5.97041 8.725L5.07041 11.775Z"
      fill="#F5B100"
    />
  </svg>
);

export function CardProduto({
  imagem = "/new-home/produtos/produto-1.png",
  nome = "Manteiga Corporal Lové Cosméticos",
  descricao = "A manteiga corporal hidrata profundamente, alivia inflamações e rachaduras, fortalece a barreira da pele e proporciona maciez imediata. Ideal para peles ressecadas, sensíveis ou com tatuagens.",
  precoOriginal = "R$ 129,99",
  preco = "R$ 99,99",
  desconto,
  parcelas = "3x R$33,33 sem juros",
  rating = 3.5,
  ultimasUnidades = true,
}: CardProdutoProps) {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <div
          key={`full-${i}`}
          className="flex flex-col items-start relative shrink-0"
          data-name="Ícone mestre"
        >
          <div className="relative shrink-0 size-[24px]" data-name="Objects / StarFilled">
            <div className="absolute inset-[18.75%_19%_18.63%_18.75%]" data-name="Vetor">
              <div className="absolute inset-0">
                <StarFilled />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div
          key="half"
          className="flex flex-col items-start relative shrink-0"
          data-name="Ícone mestre"
        >
          <div className="relative shrink-0 size-[24px]" data-name="Objects / StarHalf">
            <div className="absolute inset-[18.75%_19%_18.63%_18.75%]" data-name="Vetor">
              <div className="absolute inset-0">
                <StarHalf />
              </div>
            </div>
          </div>
        </div>
      );
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <div
          key={`empty-${i}`}
          className="flex flex-col items-start relative shrink-0"
          data-name="Ícone mestre"
        >
          <div className="relative shrink-0 size-[24px]" data-name="Objects / Star">
            <div className="absolute inset-[18.75%_19%_18.63%_18.75%]" data-name="Vetor">
              <div className="absolute inset-0">
                <StarEmpty />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return stars;
  };

  return (
    <div
      className="bg-white flex flex-col gap-[16px] items-start pb-[16px] pt-0 px-0 relative rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] size-full"
      data-name="Card de produto / Property 1=Full"
    >
      {/* 47:3826 */}
      <div
        className="flex gap-[10px] items-start justify-center max-h-[312px] relative shrink-0 w-full"
        data-node-id="47:3826"
      >
        {/* 47:3827 */}
        <div
          className="flex-[1_0_0] h-[196px] min-h-px min-w-px relative rounded-tl-[16px] rounded-tr-[16px]"
          data-node-id="47:3827"
        >
          <img
            alt={nome}
            className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-tl-[16px] rounded-tr-[16px] size-full"
            src={imagem}
          />
        </div>

        {/* 354:35669 - Frame 2608652 / Tag Container */}
        {ultimasUnidades && (
          <div
            className="absolute flex flex-col items-start left-[8px] top-[163px] w-[214px]"
            data-name="Frame 2608652"
            data-node-id="354:35669"
          >
            {/* 354:35670 - Tag */}
            <div
              className="bg-[#f8f3ed] flex gap-[4px] items-center justify-center px-[16px] py-[4px] relative rounded-[4px] w-[364px] h-[24px]"
              data-name="Tag"
              data-node-id="354:35670"
            >
              {/* Icons */}
              <div
                className="relative shrink-0 size-[16px]"
                data-name="Icons"
              >
                <div
                  className="relative shrink-0 size-[16px]"
                  data-name="screen_rotation_alt"
                >
                  <svg
                    className="block max-w-none size-full"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask id="mask0_tag" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                      <rect width="24" height="24" fill="#D9D9D9"/>
                    </mask>
                    <g mask="url(#mask0_tag)">
                      <path d="M8.14995 21.7494L6.69995 19.2994L3.94995 18.6994C3.69995 18.6494 3.49995 18.5202 3.34995 18.3119C3.19995 18.1036 3.14162 17.8744 3.17495 17.6244L3.44995 14.7994L1.57495 12.6494C1.40828 12.4661 1.32495 12.2494 1.32495 11.9994C1.32495 11.7494 1.40828 11.5327 1.57495 11.3494L3.44995 9.19939L3.17495 6.37439C3.14162 6.12439 3.19995 5.89522 3.34995 5.68689C3.49995 5.47855 3.69995 5.34939 3.94995 5.29939L6.69995 4.69939L8.14995 2.24939C8.28328 2.03272 8.46662 1.88689 8.69995 1.81189C8.93328 1.73689 9.16662 1.74939 9.39995 1.84939L12 2.94939L14.6 1.84939C14.8333 1.74939 15.0666 1.73689 15.3 1.81189C15.5333 1.88689 15.7166 2.03272 15.85 2.24939L17.3 4.69939L20.05 5.29939C20.3 5.34939 20.5 5.47855 20.65 5.68689C20.8 5.89522 20.8583 6.12439 20.825 6.37439L20.55 9.19939L22.425 11.3494C22.5916 11.5327 22.675 11.7494 22.675 11.9994C22.675 12.2494 22.5916 12.4661 22.425 12.6494L20.55 14.7994L20.825 17.6244C20.8583 17.8744 20.8 18.1036 20.65 18.3119C20.5 18.5202 20.3 18.6494 20.05 18.6994L17.3 19.2994L15.85 21.7494C15.7166 21.9661 15.5333 22.1119 15.3 22.1869C15.0666 22.2619 14.8333 22.2494 14.6 22.1494L12 21.0494L9.39995 22.1494C9.16662 22.2494 8.93328 22.2619 8.69995 22.1869C8.46662 22.1119 8.28328 21.9661 8.14995 21.7494ZM9.44995 19.9494L12 18.8494L14.6 19.9494L16 17.5494L18.75 16.8994L18.5 14.0994L20.35 11.9994L18.5 9.84939L18.75 7.04939L16 6.44939L14.55 4.04939L12 5.14939L9.39995 4.04939L7.99995 6.44939L5.24995 7.04939L5.49995 9.84939L3.64995 11.9994L5.49995 14.0994L5.24995 16.9494L7.99995 17.5494L9.44995 19.9494ZM12 16.9994C12.2833 16.9994 12.5208 16.9036 12.7125 16.7119C12.9041 16.5202 13 16.2827 13 15.9994C13 15.7161 12.9041 15.4786 12.7125 15.2869C12.5208 15.0952 12.2833 14.9994 12 14.9994C11.7166 14.9994 11.4791 15.0952 11.2875 15.2869C11.0958 15.4786 11 15.7161 11 15.9994C11 16.2827 11.0958 16.5202 11.2875 16.7119C11.4791 16.9036 11.7166 16.9994 12 16.9994ZM12 12.9994C12.2833 12.9994 12.5208 12.9036 12.7125 12.7119C12.9041 12.5202 13 12.2827 13 11.9994V7.99939C13 7.71605 12.9041 7.47855 12.7125 7.28689C12.5208 7.09522 12.2833 6.99939 12 6.99939C11.7166 6.99939 11.4791 7.09522 11.2875 7.28689C11.0958 7.47855 11 7.71605 11 7.99939V11.9994C11 12.2827 11.0958 12.5202 11.2875 12.7119C11.4791 12.9036 11.7166 12.9994 12 12.9994Z" fill="#B3261E"/>
                    </g>
                  </svg>
                </div>
              </div>
              {/* Text */}
              <p
                className="font-cera-pro font-light text-[14px] text-[#b3261e] leading-[100%] tracking-[0px] relative shrink-0"
              >
                Últimas unidades
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 47:3830 - Content Container */}
      <div
        className="flex flex-col gap-[16px] items-start px-[16px] py-0 relative flex-1 w-full"
        data-node-id="47:3830"
      >
        {/* 47:3831 - Nome do Produto */}
        <p
          className="font-cera-pro font-medium text-[16px] text-black leading-[100%] tracking-[0px] min-w-full relative shrink-0 w-min"
          data-node-id="47:3831"
        >
          {nome}
        </p>

        {/* 47:3838 - Descrição */}
        <p
          className="font-cera-pro font-light text-[14px] text-black leading-[100%] tracking-[0px] overflow-hidden text-ellipsis relative shrink-0 w-full"
          data-node-id="47:3838"
        >
          {descricao}
        </p>

        {/* 47:3839 - Preço e Rating Container */}
        <div
          className="flex items-center justify-between relative shrink-0 w-full mt-auto"
          data-node-id="47:3839"
        >
          {/* 47:3840 - Frame 2608639 / Preços */}
          <div
            className="flex flex-col gap-[2px] items-start relative shrink-0"
            data-name="Frame 2608639"
            data-node-id="47:3840"
          >
            {/* 47:3841 - Preço Original */}
            <p
              className="font-cera-pro font-light text-[12px] text-[#333] leading-none line-through decoration-solid [text-decoration-skip-ink:none] relative shrink-0"
              data-node-id="47:3841"
            >
              {precoOriginal}
            </p>

            {/* 47:3842 - Frame 2608646 / Preço Atual + Desconto */}
            <div
              className="flex gap-[8px] items-center relative shrink-0 w-full"
              data-name="Frame 2608646"
              data-node-id="47:3842"
            >
              {/* 47:3843 - Preço */}
              <p
                className="font-cera-pro font-bold text-[20px] text-black leading-none relative shrink-0"
                data-node-id="47:3843"
              >
                {preco}
              </p>
              {/* 47:3844 - Desconto (Eyebrow) */}
              <p
                className="font-cera-pro font-light text-[14px] text-[#009142] leading-none relative shrink-0"
                data-name="Eyebrow"
                data-node-id="47:3844"
              >
                {desconto}
              </p>
            </div>

            {/* 47:3845 - Parcelas */}
            <p
              className="font-cera-pro font-light text-[12px] text-[#333] leading-none relative shrink-0"
              data-node-id="47:3845"
            >
              {parcelas}
            </p>
          </div>

          {/* 47:3846 - Star Rating */}
          <div
            className="flex items-center relative shrink-0"
            data-name="Star rating"
            data-node-id="47:3846"
          >
            {/* 47:3847 - Stars */}
            <div
              className="flex gap-[2px] items-start relative shrink-0"
              data-name="Stars"
              data-node-id="47:3847"
            >
              {/* 47:3848 - Estrelas */}
              <div
                className="flex h-[12px] items-center relative shrink-0"
                data-name="Estrelas"
                data-node-id="47:3848"
              >
                {/* I47:3848;11496:12942 - Estrelas inner */}
                <div
                  className="flex items-center relative shrink-0"
                  data-name="Estrelas"
                  data-node-id="I47:3848;11496:12942"
                >
                  {renderStars()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

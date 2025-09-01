import Image from 'next/image'

export default function ProtetorSolarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="flex items-center px-4 py-2">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-white text-xl font-bold mr-4">
              <span className="bg-white text-black px-1 rounded">amazon</span>
              <span className="text-sm">.com.br</span>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="flex">
              <select className="bg-gray-100 text-black px-3 py-2 rounded-l-md text-sm border-r border-gray-300">
                <option>Todos os departamentos</option>
              </select>
              <input 
                type="text" 
                placeholder="Pesquisar Amazon.com.br" 
                className="flex-1 px-4 py-2 text-black border-t border-b border-gray-300"
              />
              <button className="bg-orange-400 hover:bg-orange-500 px-4 py-2 rounded-r-md">
                <span className="text-black">🔍</span>
              </button>
            </div>
          </div>
          
          {/* Right Side */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="hover:underline cursor-pointer">
              <div className="text-xs">Olá, faça seu login</div>
              <div className="font-bold">Contas e Listas</div>
            </div>
            
            <div className="hover:underline cursor-pointer">
              <div className="text-xs">Devoluções</div>
              <div className="font-bold">e Pedidos</div>
            </div>
            
            <div className="flex items-center hover:underline cursor-pointer">
              <span className="mr-1">🛒</span>
              <span className="font-bold">Carrinho</span>
            </div>
          </div>
        </div>
        
        {/* Secondary Navigation */}
        <div className="bg-gray-800 px-4 py-2">
          <div className="flex items-center space-x-6 text-sm">
            <span className="hover:underline cursor-pointer">📋 Todos</span>
            <span className="hover:underline cursor-pointer">Mais Vendidos</span>
            <span className="hover:underline cursor-pointer">Prime Video</span>
            <span className="hover:underline cursor-pointer">Atendimento ao Cliente</span>
            <span className="hover:underline cursor-pointer">Venda na Amazon</span>
            <span className="hover:underline cursor-pointer">Ideias para Presente</span>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-2">
        <nav className="text-sm">
          <ul className="flex items-center space-x-2 text-gray-600">
            <li><a href="#" className="text-blue-700 hover:text-red-700 hover:underline">Beleza</a></li>
            <li className="text-gray-400">›</li>
            <li><a href="#" className="text-blue-700 hover:text-red-700 hover:underline">Pele</a></li>
            <li className="text-gray-400">›</li>
            <li><a href="#" className="text-blue-700 hover:text-red-700 hover:underline">Protetores Solares e Bronzeadores</a></li>
            <li className="text-gray-400">›</li>
            <li><a href="#" className="text-blue-700 hover:text-red-700 hover:underline">Protetores Solares</a></li>
            <li className="text-gray-400">›</li>
            <li><a href="#" className="text-blue-700 hover:text-red-700 hover:underline">Protetores Solares Faciais</a></li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Product Images */}
          <div className="flex flex-col">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex">
                {/* Left Thumbnail Column */}
                <div className="flex flex-col gap-2 p-4 pr-2">
                  {[
                    { icon: '📦', active: true, text: 'Principal' },
                    { icon: '📄', active: false, text: 'Informações' },
                    { icon: '🎨', active: false, text: 'Ingredientes' },
                    { icon: '📏', active: false, text: 'Dimensões' },
                    { icon: '🎬', active: false, text: 'Vídeo' },
                    { icon: '➕', active: false, text: '3+' }
                  ].map((item, i) => (
                    <button
                      key={i}
                      className={`w-12 h-12 rounded border-2 flex items-center justify-center text-xs transition-colors flex-shrink-0 ${
                        item.active 
                          ? 'border-orange-400 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      title={item.text}
                    >
                      <span className="text-lg">{item.icon}</span>
                    </button>
                  ))}
                </div>
                
                {/* Main Image Container */}
                <div className="flex-1 relative">
                  <div className="aspect-square bg-white p-4 flex items-center justify-center">
                    <div className="w-full h-full max-w-md max-h-md bg-gray-50 rounded flex items-center justify-center relative">
                      <div className="text-gray-400 text-center">
                        <div className="w-48 h-48 mx-auto bg-gray-100 rounded mb-2 flex items-center justify-center">
                          <span className="text-4xl text-gray-300">📦</span>
                        </div>
                        <p className="text-sm">Protetor Solar L'Oréal</p>
                      </div>
                      
                      {/* Zoom indicator */}
                      <div className="absolute top-2 right-2 bg-white shadow-md rounded px-2 py-1 text-xs text-gray-600 flex items-center">
                        <span className="mr-1">🔍</span>
                        Passar o mouse para aplicar zoom
                      </div>
                    </div>
                  </div>
                  
                  {/* Share button */}
                  <button className="absolute top-4 right-4 bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-50">
                    <span className="text-gray-600">📤</span>
                  </button>
                </div>
              </div>
              
              {/* Bottom Product features */}
              <div className="px-4 pb-4 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-600">FPS 60</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-600">Hidratação</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-600">Textura leve</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-600">40g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-normal text-gray-900 mb-2">
                Protetor Solar Facial L'Oréal Paris UV Defender Hidratação FPS 60, 40g
              </h1>
              <p className="text-blue-600 hover:underline cursor-pointer text-sm">
                Visite a loja L'Oréal Paris
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4].map((star) => (
                  <span key={star} className="text-lg">★</span>
                ))}
                <span className="text-yellow-400 text-lg">✩</span>
              </div>
              <span className="text-blue-600 hover:underline cursor-pointer text-sm">
                4,6 de 5 estrelas
              </span>
              <span className="text-gray-600 text-sm">(3.754)</span>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                Escolha da Amazon
              </span>
              <span className="text-gray-700 text-sm font-semibold">
                Mais de 50 compras no mês passado
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-lg text-red-700 font-normal bg-red-100 px-2 py-1 rounded">-17%</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl text-red-700 font-normal">R$ 40,31</span>
                  <span className="text-sm text-gray-600">(R$ 1.007,75 / kg)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">De:</span>
                <span className="text-sm text-gray-600 line-through">R$ 48,90</span>
              </div>
              
              {/* Detailed Delivery Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold text-sm">prime</span>
                  <span className="text-sm text-green-700 font-semibold">
                    Entrega GRÁTIS: Quinta-feira, 4 de Setembro
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Se pedir dentro de <span className="text-green-700 font-medium">19 hrs 42 mins</span>
                </div>
                <div className="text-xs text-gray-600">
                  Enviar para <span className="font-medium">Roberto</span> - <span className="font-medium">Manaus 69077747</span>
                </div>
                <div className="bg-blue-50 p-2 rounded text-xs">
                  <span className="text-green-700 font-semibold">Adicione ao carrinho e ganhe 5% off.</span>
                  <button className="text-blue-600 hover:underline ml-1">Confira os termos</button>
                </div>
              </div>
              
              {/* Promo */}
              <div className="bg-green-100 p-2 rounded text-sm">
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  Mais por Menos: 10%
                </span>
                <span className="ml-2">off em 10 itens</span>
                <a href="#" className="text-blue-600 hover:underline ml-1">Comprar itens elegíveis</a>
              </div>
            </div>

            {/* Product Variations */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">FPS:</h3>
                <div className="flex gap-2 flex-wrap">
                  <button className="px-3 py-1 border-2 border-blue-500 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                    FPS 60
                  </button>
                  <button className="px-3 py-1 border border-gray-300 hover:border-gray-400 rounded text-sm">
                    FPS 30
                  </button>
                  <button className="px-3 py-1 border border-gray-300 hover:border-gray-400 rounded text-sm">
                    FPS 50
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tamanho:</h3>
                <div className="flex gap-2 flex-wrap">
                  <button className="px-3 py-1 border-2 border-blue-500 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                    40g - R$ 40,31
                  </button>
                  <button className="px-3 py-1 border border-gray-300 hover:border-gray-400 rounded text-sm">
                    60g - R$ 52,90
                  </button>
                  <button className="px-3 py-1 border border-gray-300 hover:border-gray-400 rounded text-sm">
                    100g - R$ 78,50
                  </button>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Sobre este item</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Proteção solar facial com FPS 60</li>
                <li>• Fórmula com ácido hialurônico para hidratação</li>
                <li>• Textura leve e não oleosa</li>
                <li>• Proteção contra raios UVA e UVB</li>
                <li>• Ideal para uso diário</li>
                <li>• Embalagem de 40g</li>
              </ul>
            </div>

            {/* Purchase Options */}
            <div className="space-y-4">
              <div className="bg-white border rounded-lg p-4">
                <div className="space-y-4">
                  {/* Seller info */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Vendido por:</span>
                    <span className="text-blue-600 hover:underline cursor-pointer text-sm">Amazon.com.br</span>
                  </div>
                  
                  {/* Stock status */}
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-green-700 font-medium">Em estoque</span>
                  </div>
                  
                  {/* Quantity selector */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium">Quantidade:</label>
                    <div className="relative">
                      <select className="appearance-none bg-white border border-gray-300 rounded px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10+</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <span className="text-gray-400">▼</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2">
                    <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2.5 px-4 rounded-full font-medium text-sm transition-colors shadow-sm border border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-600">
                      Adicionar ao carrinho
                    </button>
                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-full font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-700">
                      Comprar agora
                    </button>
                  </div>
                  
                  {/* Wishlist and compare */}
                  <div className="flex gap-4 pt-2">
                    <button className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                      <span>♡</span>
                      Adicionar à Lista
                    </button>
                    <button className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                      <span>⚖️</span>
                      Comparar
                    </button>
                  </div>
                </div>
              </div>

              {/* Trust Icons */}
              <div className="bg-white border rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600">🔒</span>
                    </div>
                    <span className="text-xs text-gray-700">Pagamentos e Segurança</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600">📦</span>
                    </div>
                    <span className="text-xs text-gray-700">Enviado pela Amazon</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600">↩️</span>
                    </div>
                    <span className="text-xs text-gray-700">Política de devolução</span>
                  </div>
                </div>
              </div>

              {/* Prime Benefits */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="text-blue-600 font-bold text-sm">prime</div>
                  <span className="text-sm text-gray-700">Frete GRÁTIS e entrega mais rápida</span>
                </div>
              </div>

              {/* Credit Card Offer */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="text-sm">
                  <span className="font-semibold text-orange-800">Cartão Amazon pré-aprovado,</span>
                  <span className="text-orange-700"> com anuidade grátis e R$ 50 em pontos para usar nesta compra. Peça agora!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="mt-12 space-y-8">
          
          {/* Frequently Bought Together */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Frequentemente comprados juntos</h2>
            <div className="flex flex-col lg:flex-row items-start gap-6">
              
              {/* Products Row */}
              <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap">
                {/* This Product */}
                <div className="w-20 h-20 bg-gray-100 rounded border">
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Este item</span>
                  </div>
                </div>
                
                <span className="text-gray-400 text-lg">+</span>
                
                {/* Related Product 1 */}
                <div className="w-20 h-20 bg-gray-100 rounded border">
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Item 2</span>
                  </div>
                </div>
                
                <span className="text-gray-400 text-lg">+</span>
                
                {/* Related Product 2 */}
                <div className="w-20 h-20 bg-gray-100 rounded border">
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Item 3</span>
                  </div>
                </div>
              </div>
              
              {/* Purchase Options */}
              <div className="lg:ml-6 space-y-3">
                <div className="text-sm space-y-1">
                  <div className="flex items-center">
                    <input type="checkbox" id="item1" checked className="mr-2" readOnly />
                    <label htmlFor="item1" className="text-sm">Este item: <span className="font-medium">R$ 40,31</span></label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="item2" defaultChecked className="mr-2" />
                    <label htmlFor="item2" className="text-sm">
                      <a href="#" className="text-blue-600 hover:underline">Hidratante Facial L'Oréal Paris, 50ml</a>: 
                      <span className="font-medium ml-1">R$ 28,90</span>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="item3" defaultChecked className="mr-2" />
                    <label htmlFor="item3" className="text-sm">
                      <a href="#" className="text-blue-600 hover:underline">Demaquilante L'Oréal Paris, 200ml</a>: 
                      <span className="font-medium ml-1">R$ 22,50</span>
                    </label>
                  </div>
                </div>
                
                <div className="border-t pt-2">
                  <div className="text-sm font-medium">Preço total: <span className="text-lg text-red-700">R$ 91,71</span></div>
                  <button className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded text-sm font-medium">
                    Adicionar todos ao carrinho
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Payment Methods */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Opções de Pagamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm">💳</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Cartão de crédito</h3>
                    <p className="text-sm text-gray-600">A Amazon aceita todos os principais cartões: Visa, Mastercard, Elo e American Express.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-sm">⚡</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Pix</h3>
                    <p className="text-sm text-gray-600">Pagamentos em tempo real, disponível a qualquer dia ou hora. Pagamento deve ser feito em até 30 minutos.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 text-sm">🧾</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Boleto bancário</h3>
                    <p className="text-sm text-gray-600">Vencimento em 1 dia útil. A data de entrega será alterada devido ao tempo de processamento.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-sm">📄</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Parcele sem cartão</h3>
                    <p className="text-sm text-gray-600">Peça seu crédito e parcele sem cartão com a Geru. Crédito disponível em instantes se aprovado.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Sua compra é segura</h4>
              <p className="text-sm text-gray-600">
                Trabalhamos constantemente para proteger a sua segurança e privacidade. Nosso sistema de segurança 
                de pagamento criptografa suas informações durante a compra. Não compartilhamos os detalhes do seu 
                cartão de crédito com vendedores parceiros e não vendemos suas informações.
              </p>
            </div>
          </section>

          {/* Product Description */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Descrição do produto</h2>
            
            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Principais benefícios</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Proteção solar FPS 60 contra raios UVA e UVB</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Hidratação intensa com ácido hialurônico</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Textura leve e de rápida absorção</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Base perfeita para maquiagem</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Indicado para</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Todos os tipos de pele</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Uso diário no rosto</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Peles que precisam de hidratação</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Proteção contra envelhecimento</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Detailed Description */}
            <div className="prose max-w-none text-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Sobre este produto</h3>
              <p className="mb-4">
                O <strong>Protetor Solar Facial UV Defender Hidratação</strong> da L'Oréal Paris oferece proteção solar eficaz 
                com <strong>FPS 60</strong>, enquanto hidrata profundamente a pele do rosto. Sua fórmula exclusiva com 
                <strong>ácido hialurônico</strong> proporciona hidratação prolongada, deixando a pele macia e protegida 
                contra os danos causados pelos raios solares.
              </p>
              
              <p className="mb-4">
                Com textura leve e não oleosa, é rapidamente absorvido pela pele, sendo ideal para uso 
                diário sob a maquiagem ou sozinho. <strong>Protege contra os raios UVA e UVB</strong>, prevenindo o 
                envelhecimento precoce, manchas solares e outros danos causados pela exposição solar.
              </p>
              
              <p className="mb-4">
                <strong>Modo de usar:</strong> Aplique uniformemente no rosto limpo e seco, 30 minutos antes 
                da exposição solar. Reaplique a cada 2 horas ou após transpiração excessiva, natação ou 
                banho de mar.
              </p>
            </div>
            
            {/* Ingredients highlight */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Ingrediente destaque</h4>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xl">💧</span>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">Ácido Hialurônico</h5>
                  <p className="text-sm text-gray-600">
                    Poderoso hidratante que retém até 1000 vezes seu peso em água, 
                    proporcionando hidratação intensa e duradoura à pele.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Specifications */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Informações técnicas</h2>
            
            {/* Tabbed specifications */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button className="py-2 px-1 border-b-2 border-orange-500 font-medium text-sm text-orange-600">
                  Detalhes do produto
                </button>
                <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Ingredientes
                </button>
                <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Uso e aplicação
                </button>
              </nav>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">Especificações básicas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Marca</span>
                    <span className="font-medium text-blue-600 hover:underline cursor-pointer">L'Oréal Paris</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Linha</span>
                    <span className="font-medium">UV Defender</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">FPS</span>
                    <span className="font-medium text-green-600">60</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Conteúdo</span>
                    <span className="font-medium">40g</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Tipo de produto</span>
                    <span className="font-medium">Protetor Solar Facial</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">Características</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Proteção</span>
                    <span className="font-medium">UVA + UVB</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Benefício principal</span>
                    <span className="font-medium">Hidratação</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Textura</span>
                    <span className="font-medium">Leve, não oleosa</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Indicado para</span>
                    <span className="font-medium">Todos os tipos de pele</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Uso</span>
                    <span className="font-medium">Facial diário</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional details */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">📦 Embalagem</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Tubo plástico</li>
                  <li>• Tampa flip-top</li>
                  <li>• Fácil aplicação</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">🧪 Fórmula</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ácido hialurônico</li>
                  <li>• Filtros UV</li>
                  <li>• Sem parabenos</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">✨ Diferenciais</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Absorção rápida</li>
                  <li>• Base para maquiagem</li>
                  <li>• Resistente à água</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Related Products */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-gray-900">Explore ofertas relacionadas</h2>
              <a href="#" className="text-blue-600 hover:underline text-sm">Ver todas as ofertas</a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="group cursor-pointer">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Produto {item}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 line-clamp-2">Produto de Beleza e Cuidados Pessoais</p>
                    <div className="flex items-center space-x-1">
                      <div className="flex text-yellow-400 text-xs">
                        <span>★★★★☆</span>
                      </div>
                      <span className="text-xs text-gray-500">(234)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs bg-red-100 text-red-700 px-1 rounded">-{10 + item * 5}%</span>
                      <span className="text-sm font-medium text-red-700">R$ {(25 + item * 5).toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Customer Reviews Preview */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-medium text-gray-900">Avaliações dos clientes</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4].map((star) => (
                      <span key={star} className="text-lg">★</span>
                    ))}
                    <span className="text-yellow-400 text-lg">✩</span>
                  </div>
                  <span className="text-gray-600 text-sm">4,6 de 5 estrelas</span>
                  <span className="text-gray-600 text-sm">3.754 avaliações globais</span>
                </div>
              </div>
              <a href="#" className="text-blue-600 hover:underline text-sm">Ver todas as avaliações</a>
            </div>
            
            <div className="space-y-4">
              {/* Review 1 */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm">M</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">Maria S.</span>
                      <div className="flex text-yellow-400 text-sm">
                        <span>★★★★★</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">Excelente protetor solar! Textura leve, não deixa a pele oleosa e protege muito bem. Uso diariamente há 3 meses.</p>
                    <span className="text-xs text-gray-500 mt-1">Avaliado no Brasil em 25 de agosto de 2024</span>
                  </div>
                </div>
              </div>
              
              {/* Review 2 */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm">A</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">Ana P.</span>
                      <div className="flex text-yellow-400 text-sm">
                        <span>★★★★☆</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">Bom custo-benefício. Hidrata bem e protege. Só achei que poderia ter uma embalagem maior para o preço.</p>
                    <span className="text-xs text-gray-500 mt-1">Avaliado no Brasil em 18 de agosto de 2024</span>
                  </div>
                </div>
              </div>
              
              {/* Review 3 */}
              <div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm">J</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">João L.</span>
                      <div className="flex text-yellow-400 text-sm">
                        <span>★★★★★</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">Produto de qualidade da L'Oréal. Absorção rápida e não resseca a pele. Recomendo!</p>
                    <span className="text-xs text-gray-500 mt-1">Avaliado no Brasil em 10 de agosto de 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="bg-gray-800 py-4">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <button className="text-white hover:underline text-sm">
              ↑ Voltar ao topo
            </button>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-3 text-sm">Conheça-nos</h3>
              <ul className="space-y-2 text-xs text-gray-300">
                <li><a href="#" className="hover:underline">Carreiras</a></li>
                <li><a href="#" className="hover:underline">Blog</a></li>
                <li><a href="#" className="hover:underline">Sobre a Amazon</a></li>
                <li><a href="#" className="hover:underline">Relações com Investidores</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-sm">Ganhe dinheiro conosco</h3>
              <ul className="space-y-2 text-xs text-gray-300">
                <li><a href="#" className="hover:underline">Venda na Amazon</a></li>
                <li><a href="#" className="hover:underline">Venda sob demanda</a></li>
                <li><a href="#" className="hover:underline">Proteja e construa sua marca</a></li>
                <li><a href="#" className="hover:underline">Programa de afiliados</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-sm">Métodos de pagamento Amazon</h3>
              <ul className="space-y-2 text-xs text-gray-300">
                <li><a href="#" className="hover:underline">Cartão de crédito Amazon</a></li>
                <li><a href="#" className="hover:underline">Parcele suas compras</a></li>
                <li><a href="#" className="hover:underline">Recarregue seu saldo</a></li>
                <li><a href="#" className="hover:underline">Cartão Presente</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-sm">Precisa de ajuda?</h3>
              <ul className="space-y-2 text-xs text-gray-300">
                <li><a href="#" className="hover:underline">Amazon e COVID-19</a></li>
                <li><a href="#" className="hover:underline">Sua conta</a></li>
                <li><a href="#" className="hover:underline">Frete e prazo de entrega</a></li>
                <li><a href="#" className="hover:underline">Devoluções e reembolsos</a></li>
                <li><a href="#" className="hover:underline">Gerencie seu conteúdo</a></li>
                <li><a href="#" className="hover:underline">Ajuda</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="text-white text-xl font-bold mr-4">
                  <span className="bg-white text-black px-1 rounded">amazon</span>
                  <span className="text-sm">.com.br</span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-300">
                  <button className="hover:underline flex items-center">
                    🌐 Português - BR
                  </button>
                  <button className="hover:underline">R$ BRL - Real Brasileiro</button>
                  <button className="hover:underline">🇧🇷 Brasil</button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-700 text-xs text-gray-400 space-y-2">
              <div className="flex flex-wrap gap-6">
                <a href="#" className="hover:underline">Condições de Uso</a>
                <a href="#" className="hover:underline">Notificação de Privacidade</a>
                <a href="#" className="hover:underline">Cookies</a>
                <a href="#" className="hover:underline">Anúncios baseados em interesse</a>
              </div>
              <p>© 1996-2024, Amazon.com, Inc. ou suas afiliadas</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
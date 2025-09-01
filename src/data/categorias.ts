export interface Subcategoria {
  nome: string;
  slug: string;
}

export interface Categoria {
  nome: string;
  slug: string;
  subcategorias: Subcategoria[];
}

export const categorias: Categoria[] = [
  {
    nome: "Maquiagem",
    slug: "maquiagem",
    subcategorias: [
      { nome: "Rosto", slug: "rosto" },
      { nome: "Olhos", slug: "olhos" },
      { nome: "Lábios", slug: "labios" },
      { nome: "Kits e Paletas", slug: "kits-paletas" }
    ]
  },
  {
    nome: "Skincare",
    slug: "skincare",
    subcategorias: [
      { nome: "Limpeza", slug: "limpeza" },
      { nome: "Hidratação", slug: "hidratacao" },
      { nome: "Proteção Solar", slug: "protecao-solar" },
      { nome: "Anti-idade e Tratamentos", slug: "anti-idade-tratamentos" }
    ]
  },
  {
    nome: "Cabelos",
    slug: "cabelos",
    subcategorias: [
      { nome: "Shampoos e Condicionadores", slug: "shampoos-condicionadores" },
      { nome: "Máscaras e Tratamentos", slug: "mascaras-tratamentos" },
      { nome: "Finalizadores", slug: "finalizadores" },
      { nome: "Coloração", slug: "coloracao" }
    ]
  },
  {
    nome: "Perfumaria",
    slug: "perfumaria",
    subcategorias: [
      { nome: "Perfumes Femininos", slug: "perfumes-femininos" },
      { nome: "Perfumes Masculinos", slug: "perfumes-masculinos" },
      { nome: "Unissex", slug: "unissex" },
      { nome: "Body Splash e Colônias", slug: "body-splash-colonias" }
    ]
  },
  {
    nome: "Corpo & Banho",
    slug: "corpo-banho",
    subcategorias: [
      { nome: "Hidratantes", slug: "hidratantes" },
      { nome: "Esfoliantes", slug: "esfoliantes" },
      { nome: "Óleos Corporais", slug: "oleos-corporais" },
      { nome: "Sabonetes", slug: "sabonetes" }
    ]
  },
  {
    nome: "Cuidados Específicos",
    slug: "cuidados-especificos",
    subcategorias: [
      { nome: "Antissinais", slug: "antissinais" },
      { nome: "Acne e Oleosidade", slug: "acne-oleosidade" },
      { nome: "Manchas e Uniformização", slug: "manchas-uniformizacao" },
      { nome: "Unhas e Cutículas", slug: "unhas-cuticulas" }
    ]
  },
  {
    nome: "Maquiagem e Skincare Natural",
    slug: "maquiagem-skincare-natural",
    subcategorias: [
      { nome: "Veganos", slug: "veganos" },
      { nome: "Cruelty-Free", slug: "cruelty-free" },
      { nome: "Orgânicos", slug: "organicos" }
    ]
  },
  {
    nome: "Kits e Combos",
    slug: "kits-combos",
    subcategorias: [
      { nome: "Skincare Completo", slug: "skincare-completo" },
      { nome: "Maquiagem Completa", slug: "maquiagem-completa" },
      { nome: "Presentes", slug: "presentes" }
    ]
  }
];

// Função utilitária para mapear nomes das categorias do cache para a estrutura organizada
export const mapCategoryName = (cacheCategoryName: string): { categoria: Categoria; subcategoria: Subcategoria } | null => {
  if (!cacheCategoryName || typeof cacheCategoryName !== 'string') return null;
  const mapping: { [key: string]: { categoriaSlug: string; subcategoriaSlug: string } } = {
    "Maquiagem Rosto": { categoriaSlug: "maquiagem", subcategoriaSlug: "rosto" },
    "Maquiagem Olhos": { categoriaSlug: "maquiagem", subcategoriaSlug: "olhos" },
    "Maquiagem Lábios": { categoriaSlug: "maquiagem", subcategoriaSlug: "labios" },
    "Maquiagem Kits e Paletas": { categoriaSlug: "maquiagem", subcategoriaSlug: "kits-paletas" },
    
    "Skincare Limpeza": { categoriaSlug: "skincare", subcategoriaSlug: "limpeza" },
    "Skincare Hidratação": { categoriaSlug: "skincare", subcategoriaSlug: "hidratacao" },
    "Skincare Proteção Solar": { categoriaSlug: "skincare", subcategoriaSlug: "protecao-solar" },
    "Skincare Anti-idade e Tratamentos": { categoriaSlug: "skincare", subcategoriaSlug: "anti-idade-tratamentos" },
    
    "Cabelos Shampoos e Condicionadores": { categoriaSlug: "cabelos", subcategoriaSlug: "shampoos-condicionadores" },
    "Cabelos Máscaras e Tratamentos": { categoriaSlug: "cabelos", subcategoriaSlug: "mascaras-tratamentos" },
    "Cabelos Finalizadores": { categoriaSlug: "cabelos", subcategoriaSlug: "finalizadores" },
    "Cabelos Coloração": { categoriaSlug: "cabelos", subcategoriaSlug: "coloracao" },
    
    "Perfumaria Perfumes Femininos": { categoriaSlug: "perfumaria", subcategoriaSlug: "perfumes-femininos" },
    "Perfumaria Perfumes Masculinos": { categoriaSlug: "perfumaria", subcategoriaSlug: "perfumes-masculinos" },
    "Perfumaria Unissex": { categoriaSlug: "perfumaria", subcategoriaSlug: "unissex" },
    "Perfumaria Body Splash e Colônias": { categoriaSlug: "perfumaria", subcategoriaSlug: "body-splash-colonias" },
    
    "Corpo & Banho Hidratantes": { categoriaSlug: "corpo-banho", subcategoriaSlug: "hidratantes" },
    "Corpo & Banho Esfoliantes": { categoriaSlug: "corpo-banho", subcategoriaSlug: "esfoliantes" },
    "Corpo & Banho Óleos Corporais": { categoriaSlug: "corpo-banho", subcategoriaSlug: "oleos-corporais" },
    "Corpo & Banho Sabonetes": { categoriaSlug: "corpo-banho", subcategoriaSlug: "sabonetes" },
    
    "Cuidados Específicos Antissinais": { categoriaSlug: "cuidados-especificos", subcategoriaSlug: "antissinais" },
    "Cuidados Específicos Acne e Oleosidade": { categoriaSlug: "cuidados-especificos", subcategoriaSlug: "acne-oleosidade" },
    "Cuidados Específicos Manchas e Uniformização": { categoriaSlug: "cuidados-especificos", subcategoriaSlug: "manchas-uniformizacao" },
    "Cuidados Específicos Unhas e Cutículas": { categoriaSlug: "cuidados-especificos", subcategoriaSlug: "unhas-cuticulas" },
    
    "Maquiagem e Skincare Natural Veganos": { categoriaSlug: "maquiagem-skincare-natural", subcategoriaSlug: "veganos" },
    "Maquiagem e Skincare Natural Cruelty-Free": { categoriaSlug: "maquiagem-skincare-natural", subcategoriaSlug: "cruelty-free" },
    "Maquiagem e Skincare Natural Orgânicos": { categoriaSlug: "maquiagem-skincare-natural", subcategoriaSlug: "organicos" },
    
    "Kits e Combos Skincare Completo": { categoriaSlug: "kits-combos", subcategoriaSlug: "skincare-completo" },
    "Kits e Combos Maquiagem Completa": { categoriaSlug: "kits-combos", subcategoriaSlug: "maquiagem-completa" },
    "Kits e Combos Presentes": { categoriaSlug: "kits-combos", subcategoriaSlug: "presentes" }
  };

  const mapped = mapping[cacheCategoryName];
  if (!mapped) return null;

  const categoria = categorias.find(cat => cat.slug === mapped.categoriaSlug);
  if (!categoria) return null;

  const subcategoria = categoria.subcategorias.find(sub => sub.slug === mapped.subcategoriaSlug);
  if (!subcategoria) return null;

  return { categoria, subcategoria };
};

export default categorias;
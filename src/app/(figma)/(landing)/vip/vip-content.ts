/**
 * Conteudo estatico da pagina VIP Landing
 * Centraliza dados hardcoded para facilitar manutencao
 */

// Link direto para o grupo VIP do WhatsApp
export const VIP_WHATSAPP_LINK = "https://chat.whatsapp.com/Iqyoy119JuzBtHNDoJkmgK";

export interface Beneficio {
  icon: string;
  title: string;
  description: string;
}

export const beneficios: Beneficio[] = [
  {
    icon: "lightning",
    title: "Lancamentos primeiro",
    description: "Fique por dentro antes - com acesso e avisos em primeira mao.",
  },
  {
    icon: "gift",
    title: "Kits & condicoes",
    description: "Condicoes especiais e campanhas exclusivas para membros do VIP.",
  },
  {
    icon: "compass",
    title: "Rotina guiada",
    description: "Conteudo pratico para montar rotina (dia/noite) e melhorar resultados.",
  },
  {
    icon: "chat",
    title: "Direto no WhatsApp",
    description: "Voce recebe no celular - sem precisar ficar procurando informacao.",
  },
];

export interface Diferencial {
  title: string;
  description: string;
}

export const diferenciais: Diferencial[] = [
  {
    title: "Nanotecnologia + bioativos amazonicos",
    description: "Tecnologia avancada aplicada a ativos da Amazonia para potencializar eficacia, absorcao e resultados visiveis.",
  },
  {
    title: "Sustentabilidade real e floresta em pe",
    description: "Valorizamos a bioeconomia amazonica com impacto positivo, respeito a floresta e as comunidades locais.",
  },
  {
    title: "Alta performance com foco em resultado",
    description: "Formulacoes pensadas para entregar beneficios reais no cuidado diario, sem promessas vazias.",
  },
  {
    title: "Premium consciente, com essencia amazonica",
    description: "Experiencia sofisticada que une qualidade, proposito e identidade amazonica em cada detalhe.",
  },
];

export interface Passo {
  numero: string;
  title: string;
  description: string;
}

export const passos: Passo[] = [
  { numero: "1", title: "Clique no botao", description: "Voce sera direcionado para o WhatsApp com o convite do VIP." },
  { numero: "2", title: "Entre no grupo", description: "Confirme a entrada no grupo VIP oficial da Love." },
  { numero: "3", title: "Receba no WhatsApp", description: "Novidades, campanhas e rotinas guiadas (sem textao)." },
  { numero: "✓", title: "Pronto", description: "E gratuito e voce pode sair quando quiser." },
];

export interface FAQ {
  pergunta: string;
  resposta: string;
}

export const faqs: FAQ[] = [
  {
    pergunta: "O VIP e gratuito?",
    resposta: "Sim. O Grupo VIP e um canal gratuito para receber novidades, campanhas e conteudos. Se quiser sair, e so sair do grupo.",
  },
  {
    pergunta: "Vou receber muito spam?",
    resposta: "A proposta e ser objetivo: avisos curtos e uteis, sem excesso. Voce controla as notificacoes do WhatsApp.",
  },
  {
    pergunta: "Como descubro a rotina ideal?",
    resposta: "No VIP voce recebe orientacoes por tipo de pele e sugestoes de rotina (dia/noite). Se quiser, pode mandar mensagem e pedir direcionamento.",
  },
];

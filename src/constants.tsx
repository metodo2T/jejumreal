import React from 'react';
import { ProtocolType, ProtocolDetail } from './types';

export const PROTOCOLS: Record<ProtocolType, ProtocolDetail> = {
  [ProtocolType.H12]: {
    id: ProtocolType.H12,
    title: 'Protocolo de 12 Horas',
    description: 'O ponto de partida ideal para iniciantes.',
    benefits: ['Melhora na digestão', 'Controle glicêmico inicial', 'Adaptação metabólica suave'],
    indicatedFor: 'Iniciantes totais ou pessoas com rotina muito instável.',
    howToStart: 'Jante às 20h e tome café da manhã às 08h.',
    allowedDuring: ['Água', 'Café sem açúcar', 'Chá sem açúcar'],
    commonMistakes: ['Exagerar na última refeição', 'Beber sucos ou refrigerantes zero'],
    menus: {
      basic: ['2 ovos cozidos', '1 fatia de queijo branco'],
      intermediate: ['Omelete com espinafre', 'Meio abacate'],
      advanced: ['Caldo de ossos nutritivo', 'Proteína magra grelhada']
    },
    pdfUrl: 'https://drive.google.com/file/d/1SsHljEJuhfIZMhcDlzeUqGmhk_MveU6C/view?usp=drive_link'
  },
  [ProtocolType.H14]: {
    id: ProtocolType.H14,
    title: 'Protocolo de 14 Horas',
    description: 'A ponte para o emagrecimento ativo.',
    benefits: ['Aumento da queima de gordura', 'Melhora na clareza mental', 'Redução de inflamação'],
    indicatedFor: 'Quem já se sente confortável com 12h de jejum.',
    howToStart: 'Pule o café da manhã ou atrase-o até o meio da manhã.',
    allowedDuring: ['Água com limão (opcional)', 'Café preto', 'Chás herbais'],
    commonMistakes: ['Compensação calórica na janela de alimentação'],
    menus: {
      basic: ['Iogurte natural com sementes', 'Fruta de baixo índice glicêmico'],
      intermediate: ['Frango grelhado com salada verde', 'Azeite de oliva'],
      advanced: ['Salmão ao forno', 'Aspargos no vapor']
    },
    pdfUrl: 'https://drive.google.com/file/d/1N_8Rr-GPgLuqz9UxkSGh_bXXKl5McRR0/view?usp=drive_link'
  },
  [ProtocolType.H16]: {
    id: ProtocolType.H16,
    title: 'Protocolo de 16 Horas (8/16)',
    description: 'O padrão ouro do jejum intermitente.',
    benefits: ['Autofagia celular', 'Perda de peso significativa', 'Regulação da insulina'],
    indicatedFor: 'Praticantes intermediários focados em resultados estéticos e de saúde.',
    howToStart: 'Almoce às 12h e jante até as 20h.',
    allowedDuring: ['Água com pitada de sal', 'Chá mate/verde', 'Café'],
    commonMistakes: ['Quebrar com excesso de carboidratos simples'],
    menus: {
      basic: ['Salada completa com proteína (carne/ovo)', 'Castanhas'],
      intermediate: ['Abobrinha recheada com carne moída', 'Queijo curado'],
      advanced: ['Corte de carne gorda (ex: picanha) com brócolis na manteiga']
    },
    pdfUrl: 'https://drive.google.com/file/d/1ZCxW_yDbHtk9MmJ6-MJjL2hKxJgoe49z/view?usp=drive_link'
  },
  [ProtocolType.H18]: {
    id: ProtocolType.H18,
    title: 'Protocolo de 18 Horas',
    description: 'Para quem busca máxima eficiência metabólica.',
    benefits: ['Renovação celular intensa', 'Controle total da saciedade', 'Redução de gordura visceral'],
    indicatedFor: 'Praticantes avançados que já dominam o jejum de 16h.',
    howToStart: 'Faça apenas duas refeições principais em uma janela de 6 horas.',
    allowedDuring: ['Água', 'Café', 'Chás'],
    commonMistakes: ['Não beber água suficiente', 'Ignorar sinais de tontura'],
    menus: {
      basic: ['Ovos mexidos com bacon', 'Salada de folhas'],
      intermediate: ['Peixe grelhado', 'Purê de couve-flor'],
      advanced: ['Jejum de 24h ocasional (sob orientação)', 'Suplementação de eletrólitos']
    },
    pdfUrl: 'https://drive.google.com/file/d/1gzRxf3OxrVnX0ReumLp1KGlOusKXy-As/view?usp=drive_link'
  },
  [ProtocolType.H20]: {
    id: ProtocolType.H20,
    title: 'Protocolo de 20 Horas (A Dieta do Guerreiro)',
    description: 'Foco extremo na renovação celular e queima de gordura.',
    benefits: ['Autofagia profunda', 'Aumento de hormônio do crescimento (GH)', 'Máxima queima de gordura teimosa'],
    indicatedFor: 'Pessoas muito experientes em jejum, que já fazem 18h com facilidade.',
    howToStart: 'Faça uma única grande refeição ou duas refeições menores em uma janela de 4 horas (ex: 16h às 20h).',
    allowedDuring: ['Água', 'Café preto', 'Chás sem açúcar', 'Água com sal/eletrólitos'],
    commonMistakes: ['Comer muito rápido na quebra do jejum', 'Não consumir proteínas e gorduras suficientes na janela de alimentação', 'Desidratação'],
    menus: {
      basic: ['Prato grande com mix de folhas, azeite, 3 ovos e 1 bife', 'Porção de abacate'],
      intermediate: ['Salmão assado com brócolis e manteiga', 'Caldo de ossos', 'Castanhas'],
      advanced: ['Corte de carne gorda (picanha/costela)', 'Ovos', 'Salada verde amarga (rúcula/agrião)']
    },
    pdfUrl: 'https://drive.google.com/file/d/1gHBTDLlHUawZ8nWI6ZIz1UJnKTGnS5V2/view?usp=drive_link'
  },
  [ProtocolType.H24]: {
    id: ProtocolType.H24,
    title: 'Protocolo de 24 Horas (OMAD - One Meal A Day)',
    description: 'Uma refeição por dia para reset metabólico e imunológico.',
    benefits: ['Reset do sistema imunológico', 'Pico de autofagia', 'Reparo celular avançado', 'Economia de tempo e foco mental extremo'],
    indicatedFor: 'Apenas praticantes muito avançados. Não recomendado para uso diário contínuo sem acompanhamento.',
    howToStart: 'Jante hoje às 20h e volte a comer apenas amanhã às 20h.',
    allowedDuring: ['Água abundante', 'Café preto', 'Chás', 'Eletrólitos (sódio, potássio, magnésio)'],
    commonMistakes: ['Fazer exercícios muito intensos durante as últimas horas', 'Quebrar o jejum com carboidratos pesados ou doces', 'Ignorar fraqueza extrema'],
    menus: {
      basic: ['Refeição completa: Proteína abundante (frango/carne/peixe), vegetais variados, azeite e abacate'],
      intermediate: ['Caldo de ossos para quebrar o jejum (esperar 30 min)', 'Bife ancho com aspargos e ovos'],
      advanced: ['Quebra com ovos cozidos', 'Refeição principal com carne vermelha gorda e vísceras (fígado)']
    },
    pdfUrl: 'https://drive.google.com/file/d/1eydHyIFLLgxKfNz_tkvL9rtKVNTv6jpV/view?usp=drive_link'
  }
};

export const ICONS = {
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Timer: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Progress: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Community: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Profile: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Add: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
};
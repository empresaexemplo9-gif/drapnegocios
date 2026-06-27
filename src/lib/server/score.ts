/**
 * Score de perfil (0–100): completude do perfil + atividade na plataforma.
 * Usado no diretório, no perfil público e no painel para ranquear e incentivar.
 */
export interface DadosScore {
  avatar: boolean;
  banner: boolean;
  bio: boolean;
  area: boolean;
  regiao: boolean;
  representa: boolean;
  posts: number;
  itens: number; // produtos + vagas publicados
}

export function pontuarPerfil(d: DadosScore): { score: number; completude: number } {
  const preenchidos = [d.avatar, d.banner, d.bio, d.area, d.regiao, d.representa].filter(Boolean).length; // 0–6
  const compPts = preenchidos * 10; // 0–60
  const ativPts = Math.min(20, d.posts * 4) + Math.min(20, d.itens * 5); // 0–40
  return {
    score: Math.max(0, Math.min(100, compPts + ativPts)),
    completude: Math.round((preenchidos / 6) * 100),
  };
}

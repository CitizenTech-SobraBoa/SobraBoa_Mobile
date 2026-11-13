import type { Session } from '../types/api';

export function validSession(value: unknown, now = Date.now()): value is Session {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Partial<Session>;
  return (
    typeof s.token === 'string' &&
    s.token.length > 0 &&
    s.tipo === 'Bearer' &&
    typeof s.usuarioId === 'number' &&
    Number.isSafeInteger(s.usuarioId) &&
    s.usuarioId > 0 &&
    typeof s.nome === 'string' &&
    ['DOADOR', 'RECEPTOR', 'ADMIN'].includes(s.papel || '') &&
    (s.aprovacao === null || ['APROVADO', 'PENDENTE', 'REJEITADO'].includes(s.aprovacao || '')) &&
    typeof s.expiraEm === 'string' &&
    Date.parse(s.expiraEm) > now
  );
}

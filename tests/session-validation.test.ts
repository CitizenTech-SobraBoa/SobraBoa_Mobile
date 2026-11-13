import { describe, expect, it } from 'vitest';
import { validSession } from '../src/auth/session';
import {
  checkWindow,
  dateOnly,
  emailValue,
  localDateTime,
  numeric,
  publicPhoto,
} from '../src/validation/forms';
describe('session', () => {
  const session = {
    token: 'test-only',
    tipo: 'Bearer',
    usuarioId: 1,
    nome: 'Teste',
    papel: 'DOADOR',
    aprovacao: 'PENDENTE',
    expiraEm: '2030-01-01T00:00:00Z',
  };
  it('accepts pending accounts without granting approval', () => {
    expect(validSession(session, Date.parse('2026-01-01'))).toBe(true);
  });
  it('rejects malformed, expired and unexpected roles', () => {
    expect(validSession(session, Date.parse(session.expiraEm))).toBe(false);
    expect(validSession({ ...session, papel: 'ROOT' }, 0)).toBe(false);
    expect(validSession({ ...session, expiraEm: 'invalid' }, 0)).toBe(false);
    expect(validSession(null)).toBe(false);
  });
});
describe('business input', () => {
  it('rejects impossible dates and accepts leap day', () => {
    expect(() => localDateTime('31/02/2028 12:30')).toThrow();
    expect(dateOnly('29/02/2028')).toBe('2028-02-29');
    expect(() => dateOnly('29/02/2027')).toThrow();
  });
  it('rejects reversed or past pickup windows', () => {
    expect(() => checkWindow('2030-01-02', '2030-01-01', 0)).toThrow();
    expect(() => checkWindow('2020-01-01', '2020-01-02', Date.parse('2026-01-01'))).toThrow();
  });
  it('does not convert blank coordinates into zero', () => {
    expect(() => numeric('', 'Latitude', -90, 90)).toThrow();
    expect(numeric('-23,5', 'Latitude', -90, 90)).toBe(-23.5);
  });
  it('rejects local image paths and normalizes email', () => {
    expect(() => publicPhoto('file:///image.jpg')).toThrow();
    expect(() => publicPhoto('http://localhost/a.jpg')).toThrow();
    expect(emailValue(' Teste@Example.org ')).toBe('teste@example.org');
  });
});

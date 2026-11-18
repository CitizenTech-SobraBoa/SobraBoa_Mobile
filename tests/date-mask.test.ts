import { describe, expect, it } from 'vitest';
import {
  dateOnly,
  exampleDate,
  exampleDateTime,
  localDateTime,
  maskDate,
  maskDateTime,
} from '../src/validation/forms';

describe('máscara de data', () => {
  it('coloca as barras sozinha enquanto digita', () => {
    expect(maskDate('1')).toBe('1');
    expect(maskDate('10')).toBe('10');
    expect(maskDate('100')).toBe('10/0');
    expect(maskDate('1003')).toBe('10/03');
    expect(maskDate('10032')).toBe('10/03/2');
    expect(maskDate('10032026')).toBe('10/03/2026');
  });

  it('ignora letras, barras repetidas e excesso de dígitos', () => {
    expect(maskDate('10/03/2026')).toBe('10/03/2026');
    expect(maskDate('1a0//03')).toBe('10/03');
    expect(maskDate('100320269999')).toBe('10/03/2026');
  });

  it('não deixa separador sobrando ao apagar', () => {
    expect(maskDate('10/')).toBe('10');
    expect(maskDate('10/03/')).toBe('10/03');
    expect(maskDateTime('10/03/2026 ')).toBe('10/03/2026');
    expect(maskDateTime('10/03/2026 14:')).toBe('10/03/2026 14');
  });

  it('monta data e hora', () => {
    expect(maskDateTime('100320261')).toBe('10/03/2026 1');
    expect(maskDateTime('1003202614')).toBe('10/03/2026 14');
    expect(maskDateTime('10032026143')).toBe('10/03/2026 14:3');
    expect(maskDateTime('100320261430')).toBe('10/03/2026 14:30');
    expect(maskDateTime('10/03/2026 14:30')).toBe('10/03/2026 14:30');
  });

  it('o texto mascarado passa na validação', () => {
    expect(dateOnly(maskDate('15112026'))).toBe('2026-11-15');
    expect(() => localDateTime(maskDateTime('151120261830'))).not.toThrow();
    expect(() => localDateTime(maskDateTime('311320261830'))).toThrow();
  });
});

describe('exemplos de data', () => {
  const now = new Date(2026, 10, 30, 15, 0);
  it('calcula a partir de hoje, virando o mês e o ano', () => {
    expect(exampleDate(0, now)).toBe('30/11/2026');
    expect(exampleDate(3, now)).toBe('03/12/2026');
    expect(exampleDate(40, now)).toBe('09/01/2027');
    expect(exampleDateTime(1, 9, 0, now)).toBe('01/12/2026 09:00');
  });
  it('o exemplo já respeita a máscara e a validação', () => {
    const example = exampleDateTime(1, 12, 0, now);
    expect(maskDateTime(example)).toBe(example);
    expect(() => localDateTime(example)).not.toThrow();
  });
});

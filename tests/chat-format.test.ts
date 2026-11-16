import { describe, expect, it } from 'vitest';
import { formatReply } from '../src/chat/format';

const fence = (data: object) => '```json\n' + JSON.stringify(data, null, 2) + '\n```';

describe('formatReply', () => {
  it('shows only the message when nothing was analysed', () => {
    const raw = fence({
      aprovado: false,
      categoria: 'Outros',
      alerta_cadeia_fria: false,
      validade_estimada: '',
      cuidados_transporte: '',
      observacoes: 'Olá! Envie os detalhes do alimento.',
      motivo_recusa: 'Nenhum alimento foi informado.',
    });
    expect(formatReply(raw)).toBe('Olá! Envie os detalhes do alimento.');
  });

  it('treats N/A as empty', () => {
    const raw = fence({
      aprovado: false,
      validade_estimada: 'N/A',
      cuidados_transporte: 'N/A',
      observacoes: '',
      motivo_recusa: 'Não é um alimento.',
    });
    expect(formatReply(raw)).toBe('Não é um alimento.');
  });

  it('formats an approved analysis', () => {
    const raw = fence({
      aprovado: true,
      categoria: 'Pães e Confeitaria',
      alerta_cadeia_fria: false,
      validade_estimada: '1 a 2 dias',
      cuidados_transporte: 'Sacos fechados.',
      observacoes: 'Sem sinais de mofo.',
      motivo_recusa: null,
    });
    expect(formatReply(raw)).toBe(
      [
        '✅ Pode doar',
        'Categoria: Pães e Confeitaria',
        'Validade estimada: 1 a 2 dias',
        'Cuidados no transporte: Sacos fechados.',
        'Observações: Sem sinais de mofo.',
      ].join('\n'),
    );
  });

  it('formats a refusal with cold chain alert', () => {
    const raw = fence({
      aprovado: false,
      categoria: 'Laticínios',
      alerta_cadeia_fria: true,
      validade_estimada: 'vencido',
      cuidados_transporte: '',
      observacoes: '',
      motivo_recusa: 'Produto vencido.',
    });
    expect(formatReply(raw)).toBe(
      [
        '❌ Não pode doar',
        'Categoria: Laticínios',
        'Validade estimada: vencido',
        '❄️ Precisa de cadeia fria (refrigeração)',
        'Motivo da recusa: Produto vencido.',
      ].join('\n'),
    );
  });

  it('accepts JSON without a code fence', () => {
    expect(formatReply('{"aprovado":false,"observacoes":"Oi!"}')).toBe('Oi!');
  });

  it('keeps plain text and unknown JSON as they came', () => {
    expect(formatReply('  Olá, tudo bem?  ')).toBe('Olá, tudo bem?');
    expect(formatReply('{"foo":1}')).toBe('{"foo":1}');
    expect(formatReply('```json\n{quebrado\n```')).toBe('```json\n{quebrado\n```');
  });
});

const FENCE = /^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/i;

type Analysis = {
  aprovado?: unknown;
  categoria?: unknown;
  alerta_cadeia_fria?: unknown;
  validade_estimada?: unknown;
  cuidados_transporte?: unknown;
  observacoes?: unknown;
  motivo_recusa?: unknown;
};

const KEYS: (keyof Analysis)[] = [
  'aprovado',
  'categoria',
  'validade_estimada',
  'cuidados_transporte',
  'observacoes',
  'motivo_recusa',
];

function clean(value: unknown) {
  if (typeof value !== 'string') return '';
  const text = value.trim();
  return /^(n\/?a|null|-)$/i.test(text) ? '' : text;
}

function parse(raw: string): Analysis | null {
  const body = FENCE.exec(raw)?.[1] ?? raw.trim();
  if (!body.startsWith('{')) return null;
  try {
    const data: unknown = JSON.parse(body);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    return KEYS.some((key) => key in data) ? (data as Analysis) : null;
  } catch {
    return null;
  }
}

export function formatReply(raw: string) {
  const analysis = parse(raw);
  if (!analysis) return raw.trim();
  const validity = clean(analysis.validade_estimada);
  const care = clean(analysis.cuidados_transporte);
  const notes = clean(analysis.observacoes);
  const refusal = clean(analysis.motivo_recusa);
  const approved = analysis.aprovado === true;
  if (!approved && !validity && !care) return notes || refusal || raw.trim();
  const lines = [approved ? '✅ Pode doar' : '❌ Não pode doar'];
  const category = clean(analysis.categoria);
  if (category) lines.push(`Categoria: ${category}`);
  if (validity) lines.push(`Validade estimada: ${validity}`);
  if (analysis.alerta_cadeia_fria === true) lines.push('❄️ Precisa de cadeia fria (refrigeração)');
  if (care) lines.push(`Cuidados no transporte: ${care}`);
  if (notes) lines.push(`Observações: ${notes}`);
  if (refusal) lines.push(`Motivo da recusa: ${refusal}`);
  return lines.join('\n');
}

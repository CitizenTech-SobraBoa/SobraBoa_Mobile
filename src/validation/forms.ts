export function required(value: string, label: string) {
  if (!value.trim()) throw new Error(`Preencha ${label}.`);
  return value.trim();
}
export function numeric(value: string, label: string, min: number, max = Infinity) {
  const number = Number(required(value, label).replace(',', '.'));
  if (!Number.isFinite(number) || number < min || number > max)
    throw new Error(
      `${label}: informe um número entre ${min} e ${max === Infinity ? 'o limite permitido' : max}.`,
    );
  return number;
}
export function emailValue(value: string) {
  const email = required(value, 'e-mail').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Informe um e-mail válido.');
  return email;
}
export function maskDate(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 8);
  let out = d.slice(0, 2);
  if (d.length > 2) out += `/${d.slice(2, 4)}`;
  if (d.length > 4) out += `/${d.slice(4, 8)}`;
  return out;
}
export function maskDateTime(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 12);
  let out = maskDate(d.slice(0, 8));
  if (d.length > 8) out += ` ${d.slice(8, 10)}`;
  if (d.length > 10) out += `:${d.slice(10, 12)}`;
  return out;
}
export function exampleDate(daysAhead = 0, now = new Date()) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysAhead);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
export function exampleDateTime(daysAhead: number, hour: number, minute = 0, now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${exampleDate(daysAhead, now)} ${pad(hour)}:${pad(minute)}`;
}
export function localDateTime(value: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) throw new Error('Use a data e hora no formato DD/MM/AAAA HH:mm.');
  const [, day, month, year, hour, minute] = match.map(Number);
  const date = new Date(year!, month! - 1, day, hour, minute);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month! - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute
  )
    throw new Error('Data ou hora inválida.');
  return date.toISOString();
}
export function dateOnly(value: string): string | null {
  if (!value.trim()) return null;
  localDateTime(`${value} 12:00`);
  const [day, month, year] = value.trim().split('/');
  return `${year}-${month}-${day}`;
}
export function editDate(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
export function displayDate(value: string) {
  return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
export function checkWindow(start: string, end: string, now = Date.now()) {
  if (Date.parse(end) <= Date.parse(start))
    throw new Error('A retirada deve terminar depois de começar.');
  if (Date.parse(end) <= now) throw new Error('O fim da retirada precisa estar no futuro.');
}
export function publicPhoto(value: string) {
  if (!value.trim()) return '';
  try {
    const url = new URL(value.trim());
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      !url.hostname ||
      url.username ||
      url.password
    )
      throw new Error();
  } catch {
    throw new Error('A foto deve ser uma URL pública HTTP ou HTTPS, sem credenciais.');
  }
  if (/^(https?:\/\/)(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(value))
    throw new Error('Use uma foto hospedada em endereço público.');
  return value.trim();
}

export type Role = 'DOADOR' | 'RECEPTOR' | 'ADMIN';
export type Approval = 'PENDENTE' | 'APROVADO' | 'REJEITADO';
export interface Session {
  token: string;
  tipo: 'Bearer';
  expiraEm: string;
  usuarioId: number;
  nome: string;
  papel: Role;
  aprovacao: Approval | null;
}
export interface Address {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  latitude: number;
  longitude: number;
}
export interface RegistrationBase {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  cnpj: string | null;
  endereco: Address;
  aceitouTermos: boolean;
}
export interface DonorRegistration extends RegistrationBase {
  nomeFantasia: string;
  razaoSocial: string;
  tipoEstabelecimento: string;
}
export interface ReceiverRegistration extends RegistrationBase {
  nomeOrganizacao: string;
  tipo: string;
  pessoasAtendidas: number | null;
  possuiRefrigeracao: boolean;
  horarioFuncionamento: string;
}
export interface Page<T> {
  content: T[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}
export type DonationStatus =
  'RASCUNHO' | 'DISPONIVEL' | 'RESERVADA' | 'RETIRADA' | 'CONCLUIDA' | 'CANCELADA' | 'EXPIRADA';
export type Unit = 'UN' | 'KG' | 'PORCAO' | 'CAIXA' | 'LITRO';
export interface Category {
  id: number;
  nome: string;
  requerRefrigeracaoPadrao: boolean;
  observacaoCuidado: string | null;
}
export interface ItemRequest {
  categoriaId: number;
  descricao: string;
  quantidade: number;
  unidade: Unit;
  pesoEstimadoKg: number | null;
  dataValidade: string | null;
  preparadoEm: string | null;
}
export interface ItemResponse {
  id: number;
  categoria: string;
  descricao: string;
  quantidade: number;
  unidade: Unit;
  pesoEstimadoKg: number | null;
  dataValidade: string | null;
}
export interface DonationRequest {
  titulo: string;
  descricao: string;
  janelaFim: string;
  janelaInicio: string;
  requerRefrigeracao: boolean;
  instrucoesRetirada: string;
  fotoUrl: string;
  enderecoRetiradaId: number | null;
  itens: ItemRequest[];
}
export interface Donation extends Omit<DonationRequest, 'itens' | 'enderecoRetiradaId'> {
  id: number;
  status: DonationStatus;
  doador: string;
  cidade: string;
  itens: ItemResponse[];
}
export interface Reservation {
  id: number;
  doacaoId: number;
  tituloDoacao: string;
  status: 'ATIVA' | 'RETIRADA' | 'CONCLUIDA' | 'CANCELADA' | 'EXPIRADA';
  codigoRetirada: string;
  expiraEm: string;
}
export interface PendingRegistration {
  usuarioId: number;
  nome: string;
  email: string;
  cnpj: string | null;
  status: Approval;
}
export interface Metrics {
  doacoesPorStatus: Record<string, number>;
  kgDoados: number;
  doadoresAprovados: number;
  receptoresAprovados: number;
  taxaAproveitamento: number;
}
export interface ApiError {
  status: number;
  erro: string;
  mensagem: string;
  caminho: string;
  campos: { campo: string; mensagem: string }[] | null;
}

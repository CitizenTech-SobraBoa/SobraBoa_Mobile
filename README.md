# SobraBoa

Aplicativo mobile do SobraBoa, nosso projeto da Global Solution 2026/2 da FIAP (CitizenTech). A ideia é simples: comércios que têm alimento sobrando doam, e ONGs e casas de acolhida reservam e retiram, em vez de a comida ir para o lixo.

O app é feito em React Native com Expo e TypeScript e conversa com a API Java. Toda a regra de negócio e os dados ficam na API; o app só consome os endpoints.

## Equipe

| Nome                              | RM     |
| --------------------------------- | ------ |
| Pedro Vaz Ferreira                | 566551 |
| João Victor Luiz Oliveira Resende | 565139 |
| Vitor Dias dos Santos             | 565422 |
| Felipe Kirschner Modesto          | 561810 |

## O que o app faz

Existem três perfis, cada um com suas telas:

- **Doador:** cadastra uma doação (itens, validade, janela de retirada), revisa o rascunho, publica e confirma a retirada pelo código que o receptor apresenta.
- **Receptor:** busca doações perto de onde está, reserva, acompanha as reservas e confirma o recebimento.
- **Administrador:** aprova ou rejeita os cadastros novos de doadores e receptores e vê as métricas de impacto.

Doadores e receptores só criam doações ou reservas depois de aprovados pelo administrador.

Além dessas telas, o app tem login e cadastro, uma tela de conta com logout e a tela "Sobre o App".

### Assistente de IA

A aba do assistente está pronta (conversa, envio, tentar de novo em caso de falha), mas **ainda não está ligada a nenhum serviço**. A API não tem um endpoint de conversa. O único endpoint de IA, `POST /api/doacoes/assistente`, cria rascunhos de doação e não serve como chat. Por isso o app mostra "O assistente está em preparação. Tente novamente em breve." em vez de inventar respostas.

## Como rodar

Precisa de Node 22.13 ou mais novo, npm e um emulador Android (ou um celular com o Expo Go compatível com o SDK 55).

```powershell
npm ci
Copy-Item .env.example .env
npm start
```

No Expo, aperte `a` para abrir no emulador ou use `npm run android`. Se já existir um `.env`, não sobrescreva.

### Conexão com a API

A variável `EXPO_PUBLIC_API_URL` do `.env` é o endereço da API, **sem `/api` no final**. Depois de mudar o `.env`, reinicie o Expo.

| Onde a API está     | Valor                                    |
| ------------------- | ---------------------------------------- |
| Publicada no Render | `https://sobraboa-api-java.onrender.com` |
| Local, no emulador  | `http://10.0.2.2:8080`                   |
| Local, no celular   | `http://IP_DO_SEU_PC:8080` (mesma rede)  |

A API no Render é do plano gratuito e "dorme" quando fica parada. A primeira chamada pode demorar mais de um minuto e o app desiste em 30 segundos. Se der erro de conexão logo de início, espere a API acordar e tente de novo.

## Contas para testar

O administrador é criado pela API com o e-mail e a senha das variáveis `ADMIN_EMAIL` e `ADMIN_SENHA` (veja o README da API). Essas credenciais não ficam no app.

Quando o banco está vazio, a API também cria contas de demonstração, todas com a senha `Senha@123`:

| Perfil   | E-mail                     | Situação                   |
| -------- | -------------------------- | -------------------------- |
| Doador   | `padaria@sobraboa.com`     | aprovado                   |
| Doador   | `restaurante@sobraboa.com` | aprovado                   |
| Doador   | `hortifruti@sobraboa.com`  | pendente                   |
| Receptor | `ong@sobraboa.com`         | aprovado                   |
| Receptor | `casa@sobraboa.com`        | aprovado, sem refrigeração |

Para aprovar um cadastro novo: entre como administrador, abra a aba **Cadastros**, escolha Doadores ou Receptores e toque em Aprovar. A API não tem rota para consultar a aprovação atual, então a pessoa aprovada precisa **sair e entrar de novo** para o app enxergar a mudança.

## Estrutura do projeto

```
src/
  auth/         sessão, SecureStore, expiração do token
  chat/         conversa do assistente (em memória)
  components/   componentes reutilizáveis
  hooks/        hooks de requisição e de layout
  navigation/   rotas e abas por perfil
  screens/      telas
  services/     cliente Axios e chamadas à API
  theme/        cores e fontes
  types/        tipos dos contratos da API
  validation/   validação dos formulários
assets/         ícones, imagens e fontes
scripts/        geração de ícones e checagem de release
tests/          testes automatizados
```

Decisões que valem citar:

- Todas as chamadas HTTP passam por um único cliente Axios (`src/services/http.ts`). Nenhuma tela chama a API direto.
- O token fica no SecureStore. Senha não é salva. Uma resposta 401 encerra a sessão; um 403 só mostra o erro.
- Excluir uma doação cancela ela na API (exclusão lógica), então o registro continua existindo.
- Datas e horas digitadas no fuso do aparelho são enviadas para a API em formato ISO com offset.

### Limitações da API que afetam o app

- A resposta de uma doação não traz a categoria, o horário de preparo nem o endereço de retirada. Ao editar, o app pede para o usuário informar de novo o que a API não devolve.
- Não existe lista de reservas para o doador. Para confirmar uma retirada, o doador digita o ID e o código que aparecem na reserva do receptor.
- Não existe rota para consultar o próprio perfil nem renovar o token.

## Testes e verificações

```powershell
npm run typecheck
npm run lint
npm run format:check
npm test
```

`npm test` roda 20 testes (Vitest) sobre a conversa do assistente, a validação da sessão, o envio do token e as rotas dos serviços. Eles não testam as telas; essa parte foi conferida na mão, no emulador.

## Gerar o APK

O `eas.json` já tem os perfis `preview` e `production`, que geram um APK Android. O pacote é `br.com.fiap.sobraboa.mobile`.

```powershell
npx eas-cli login
npx eas-cli init
$env:EXPO_PUBLIC_API_URL = 'https://sobraboa-api-java.onrender.com'
npm run release:check
npx eas-cli build --platform android --profile preview
```

O `release:check` exige um repositório git com a árvore limpa e a URL da API em HTTPS. Anote o commit usado em cada build, porque um commit novo pede um build novo. Guarde as chaves de assinatura fora do repositório (o `.gitignore` já cobre `*.jks`, `*.keystore` e `credentials.json`).

Para distribuir pelo Firebase App Distribution:

```powershell
npx firebase-tools login
npx firebase-tools appdistribution:distribute .\sobraboa.apk --app "ID_DO_APP_NO_FIREBASE" --testers "email@exemplo.com" --release-notes "SobraBoa 1.0.0"
```

## Créditos

- Fonte Nunito Sans (licença SIL OFL 1.1) e ícones Ionicons (licença MIT, via `@expo/vector-icons`).
- Ícone, splash e marca foram criados por nós em SVG (`npm run assets` gera os PNGs).
- As imagens do cabeçalho, da tela inicial do doador e do papel de parede do chat foram fornecidas pela equipe. A origem e a licença delas estão em `assets/images/ATRIBUICAO.md`.

# SobraBoa

Aplicativo mobile do SobraBoa, nosso projeto da Global Solution 2026/2 da FIAP (CitizenTech). A ideia é simples: comércios que têm alimento sobrando doam, e ONGs e casas de acolhida reservam e retiram, em vez de a comida ir para o lixo.

O app é feito em React Native com Expo e TypeScript e conversa com a API Java do projeto. Toda a regra de negócio e os dados ficam na API; o app só consome os endpoints.

| O quê                 | Onde                                                    |
| --------------------- | ------------------------------------------------------- |
| Repositório           | https://github.com/CitizenTech-SobraBoa/SobraBoa_Mobile |
| API Java (backend)    | https://sobraboa-api-java.onrender.com                  |
| API de IA             | https://sobraboa-ia.onrender.com                        |
| APK                   | Firebase App Distribution, projeto `sobraboa-37fec`     |
| Vídeo de demonstração | (link do YouTube será colocado aqui)                    |

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
- **Receptor:** busca doações perto de uma localização, reserva, acompanha as reservas e confirma o recebimento.
- **Administrador:** aprova ou rejeita os cadastros novos de doadores e receptores e vê as métricas de impacto.

Doadores e receptores só criam doações ou reservas depois de aprovados pelo administrador.

### Telas

| Tela                 | Quem usa          | Para quê                                                      |
| -------------------- | ----------------- | ------------------------------------------------------------- |
| Login                | todos             | entrar com e-mail e senha                                     |
| Cadastro             | todos             | criar conta de doador ou receptor, com endereço e localização |
| Início               | doador e receptor | atalhos e situação da aprovação do cadastro                   |
| Minhas doações       | doador            | lista paginada das doações                                    |
| Nova doação / Editar | doador            | itens, janela de retirada, refrigeração e foto                |
| Detalhes da doação   | doador e receptor | informações, publicar, cancelar ou reservar                   |
| Explorar             | receptor          | busca de doações por latitude, longitude e raio               |
| Minhas reservas      | receptor          | código de retirada, cancelamento e confirmação de recebimento |
| Confirmar retirada   | doador            | confirma a entrega com o ID e o código do receptor            |
| Assistente IA        | doador e receptor | conversa com a IA de triagem de alimentos                     |
| Cadastros            | administrador     | aprovar ou rejeitar cadastros e ver métricas                  |
| Conta                | todos             | dados do login e sair                                         |
| Sobre o App          | todos             | equipe e commit usado no build                                |

### Assistente de IA

O chat usa a API de IA do projeto (`https://sobraboa-ia.onrender.com`), configurada em `EXPO_PUBLIC_CHAT_URL`. O app envia `POST /chat` com `{ "mensagem": "..." }` e recebe `{ "resposta": "..." }`, sem autenticação.

A IA é uma triagem de alimentos e responde em JSON (aprovado, categoria, validade estimada, cuidados de transporte e observações). O app transforma isso em texto legível: "Pode doar" ou "Não pode doar", categoria, validade e cuidados. Se a resposta vier em outro formato, o texto aparece como chegou.

Se o serviço falhar, a mensagem fica marcada e dá para tocar nela para tentar de novo. O chat é só de texto, não envia imagem. O histórico fica em memória e some ao sair da conta.

## Como rodar

Precisa de Node 22.13 ou mais novo, npm e um emulador Android (ou um celular com o Expo Go compatível com o SDK 55).

```powershell
npm ci
Copy-Item .env.example .env
npm start
```

No Expo, aperte `a` para abrir no emulador ou use `npm run android`. Se já existir um `.env`, não sobrescreva.

### Variáveis do `.env`

| Variável               | Para quê                          | Valor                                    |
| ---------------------- | --------------------------------- | ---------------------------------------- |
| `EXPO_PUBLIC_API_URL`  | API Java, **sem `/api` no final** | `https://sobraboa-api-java.onrender.com` |
| `EXPO_PUBLIC_CHAT_URL` | API de IA do assistente           | `https://sobraboa-ia.onrender.com`       |

Depois de mudar o `.env`, reinicie o Expo com `npx expo start -c`. Para uma API Java local, use `http://10.0.2.2:8080` no emulador ou `http://IP_DO_SEU_PC:8080` no celular, na mesma rede.

As duas APIs ficam no plano gratuito do Render e "dormem" quando ficam paradas. A primeira chamada pode demorar mais de um minuto, e o app desiste em 30 segundos. Se der erro de conexão logo de início, espere acordar e tente de novo.

## Contas para testar

Contas de demonstração da API. Todas, menos a do administrador, usam a senha `Senha@123`:

| Perfil        | E-mail                     | Senha         | Situação                                |
| ------------- | -------------------------- | ------------- | --------------------------------------- |
| Administrador | `admin@sobraboa.com`       | `Admin@12345` | aprova cadastros e vê métricas          |
| Doador        | `padaria@sobraboa.com`     | `Senha@123`   | aprovado                                |
| Doador        | `restaurante@sobraboa.com` | `Senha@123`   | aprovado                                |
| Doador        | `hortifruti@sobraboa.com`  | `Senha@123`   | pendente (bom para mostrar a aprovação) |
| Receptor      | `ong@sobraboa.com`         | `Senha@123`   | aprovado, com refrigeração              |
| Receptor      | `casa@sobraboa.com`        | `Senha@123`   | aprovado, sem refrigeração              |

A conta do administrador é criada pela API a partir das variáveis `ADMIN_EMAIL` e `ADMIN_SENHA`. A senha acima é a padrão da API de demonstração; se ela foi trocada no servidor, vale a que estiver configurada lá.

A API não tem rota para consultar a aprovação atual. Depois que o administrador aprova alguém, essa pessoa precisa **sair e entrar de novo** para o app enxergar a mudança.

### Coordenadas de exemplo

A aba Explorar busca por coordenadas, com raio de até 50 km. Para as doações de exemplo, que ficam em São Paulo, use:

| Cidade                  | Latitude   | Longitude  |
| ----------------------- | ---------- | ---------- |
| São Paulo (Praça da Sé) | `-23.5505` | `-46.6333` |
| Rio de Janeiro          | `-22.9068` | `-43.1729` |
| Porto Alegre            | `-30.0346` | `-51.2177` |

A busca só mostra doações **publicadas** com a janela de retirada **aberta**. Se não aparecer nada, crie e publique uma doação nova com horário no futuro.

### Roteiro rápido de teste

1. Entre como **administrador**, abra **Cadastros** e aprove um cadastro pendente.
2. Entre como **doador** (`padaria@sobraboa.com`), crie uma doação com retirada no futuro e publique.
3. Entre como **receptor** (`ong@sobraboa.com`), abra **Explorar**, busque com as coordenadas de São Paulo e raio 50, abra a doação e reserve.
4. Em **Minhas reservas**, anote o ID e o código.
5. Volte ao **doador**, abra **Confirmar retirada** e informe o ID e o código.
6. No **receptor**, confirme o recebimento.
7. Em qualquer perfil, abra o **Assistente IA** e pergunte sobre um alimento, por exemplo "Tenho 10 pães franceses de ontem".

## Requisitos da disciplina

| Requisito                          | Onde está                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1. Mínimo de 6 telas com navegação | 12 telas (fora a tela Sobre), com React Navigation (pilha e abas por perfil), em `src/navigation` |
| 2. CRUD com a API usando Axios     | doações: criar, listar, editar e cancelar; cliente em `src/services`                              |
| 3. Autenticação                    | cadastro, login, logout e rotas protegidas, em `src/auth`                                         |
| 4. Identidade visual               | cores e fontes em `src/theme`, ícone, splash e imagens em `assets`                                |
| 5. Arquitetura                     | pastas por responsabilidade, ESLint, Prettier e testes                                            |
| 6. Vídeo                           | link na tabela do início deste README                                                             |
| 7. Publicação e "Sobre o App"      | Firebase App Distribution e hash do commit na tela Sobre                                          |

## Bibliotecas

| Biblioteca                                    | Para quê                                                  |
| --------------------------------------------- | --------------------------------------------------------- |
| `expo`, `react-native`, `react`               | base do aplicativo                                        |
| `@react-navigation/*`                         | pilha de telas e abas por perfil                          |
| `react-native-screens`, `safe-area-context`   | dependências da navegação e áreas seguras do aparelho     |
| `axios`                                       | chamadas às APIs, com cliente único e tratamento de erro  |
| `expo-secure-store`                           | guarda o token da sessão de forma segura                  |
| `expo-location`                               | localização do aparelho no cadastro e na busca            |
| `expo-font`, `@expo-google-fonts/nunito-sans` | fonte do app, carregada antes da interface                |
| `@expo/vector-icons`                          | ícones das abas e botões                                  |
| `expo-constants`                              | lê o commit usado no build, para a tela Sobre             |
| `expo-splash-screen`, `expo-status-bar`       | tela de abertura e barra de status                        |
| `typescript`, `eslint`, `prettier`            | tipos, lint e formatação padronizada                      |
| `vitest`                                      | testes automatizados                                      |
| `sharp`                                       | gera os ícones e reduz as imagens (só em desenvolvimento) |

## Estrutura do projeto

```
src/
  auth/         sessão, SecureStore, expiração do token
  chat/         conversa do assistente e formatação da resposta da IA
  components/   componentes reutilizáveis
  hooks/        hooks de requisição e de layout
  navigation/   rotas e abas por perfil
  screens/      telas
  services/     cliente Axios e chamadas à API
  theme/        cores e fontes
  types/        tipos dos contratos da API
  validation/   validação e máscara dos formulários
assets/         ícones, imagens e fontes
scripts/        geração de ícones e checagem de release
tests/          testes automatizados
```

Decisões que valem citar:

- Todas as chamadas HTTP da API Java passam por um único cliente Axios (`src/services/http.ts`). Nenhuma tela chama a API direto.
- O token fica no SecureStore. Senha não é salva. Uma resposta 401 encerra a sessão; um 403 só mostra o erro.
- Excluir uma doação cancela ela na API (exclusão lógica), então o registro continua existindo.
- Datas e horas digitadas no fuso do aparelho são enviadas para a API em formato ISO com offset. Os campos de data têm máscara: digite só os números.

### Limitações da API que afetam o app

- A busca de doações exige latitude, longitude e raio de até 50 km. Não existe rota para listar todas as doações disponíveis.
- A resposta de uma doação não traz a categoria, o horário de preparo nem o endereço de retirada. Ao editar, o app pede para o usuário informar de novo o que a API não devolve.
- Não existe lista de reservas para o doador. Para confirmar uma retirada, o doador digita o ID e o código que aparecem na reserva do receptor.
- Não existe rota para consultar o próprio perfil nem renovar o token.
- A API de IA recebe só texto. Ela aceita o link de uma imagem em outra rota (`/analisar-alimento`), mas o app não usa essa rota.

## Testes e verificações

```powershell
npm run typecheck
npm run lint
npm run format:check
npm test
```

`npm test` roda 33 testes (Vitest) sobre a conversa do assistente, a formatação da resposta da IA, as máscaras de data, a validação da sessão, o envio do token e as rotas dos serviços. Eles não testam as telas; essa parte foi conferida na mão, no emulador.

## Gerar o APK e distribuir

O `eas.json` tem os perfis `preview` e `production`, que geram um APK Android. O pacote é `br.com.fiap.sobraboa.mobile`, e o projeto está ligado ao EAS (`@pedrovaz100/sobraboa`). As URLs das duas APIs já estão no perfil de build.

```powershell
npx eas-cli login
npm run release:check
npx eas-cli build --platform android --profile preview
```

O `release:check` exige um repositório git com a árvore limpa e a URL da API em HTTPS. O commit usado no build aparece no rodapé da tela "Sobre o App", então um commit novo pede um build novo. As chaves de assinatura ficam com o EAS, fora do repositório (o `.gitignore` também cobre `*.jks`, `*.keystore` e `credentials.json`).

Para distribuir pelo Firebase App Distribution (projeto `sobraboa-37fec`):

```powershell
npx firebase-tools login
npx firebase-tools appdistribution:distribute .\sobraboa.apk --app "1:205329048954:android:fe850dcd8d651bf82f62c3" --testers "email@exemplo.com" --release-notes "SobraBoa 1.0.0"
```

O tester recebe um e-mail do Firebase com o link para instalar o app.

## Créditos

- Fonte Nunito Sans (licença SIL OFL 1.1) e ícones Ionicons (licença MIT, via `@expo/vector-icons`).
- Ícone, splash e marca foram criados por nós em SVG (`npm run assets` gera os PNGs).
- As imagens do cabeçalho, da tela inicial, do login e do papel de parede do chat foram fornecidas pela equipe. A origem e a licença delas estão em `assets/images/ATRIBUICAO.md`.

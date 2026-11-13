const { execFileSync } = require('node:child_process');
const path = require('node:path');
function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
try {
  let commit;
  if (process.env.EAS_BUILD === 'true') {
    commit = process.env.EAS_BUILD_GIT_COMMIT_HASH;
    if (!commit || !/^[a-f0-9]{40}$/i.test(commit))
      throw new Error('O EAS não forneceu um SHA de origem verificável.');
  } else {
    const root = path.resolve(git('rev-parse', '--show-toplevel'));
    if (![process.cwd(), path.dirname(process.cwd())].some((p) => path.resolve(p) === root))
      throw new Error(
        'Crie um repositório próprio para o app ou para este workspace. O Git da pasta do usuário não identifica esta entrega.',
      );
    if (git('status', '--porcelain'))
      throw new Error(
        'A árvore Git deve estar limpa antes do build. Registre os arquivos da entrega em um commit real.',
      );
    commit = git('rev-parse', 'HEAD');
  }
  const apiURL = process.env.EXPO_PUBLIC_API_URL;
  if (!apiURL || !apiURL.startsWith('https://'))
    throw new Error(
      'Defina EXPO_PUBLIC_API_URL com o endereço HTTPS publicado da API para o build de entrega.',
    );
  console.log(`Build de entrega autorizado para o commit ${commit}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

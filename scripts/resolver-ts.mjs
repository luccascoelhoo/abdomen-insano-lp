// Deixa os scripts de checagem importarem o código do site direto no Node,
// sem build: resolve o atalho `@/` (= `src/`, como no tsconfig) e os imports
// sem extensão (`./calculos` → `./calculos.ts`), que o Next aceita e o Node não.
//
//   node --import ./scripts/resolver-ts.mjs scripts/checar-caminhos.mjs
//
// (Node 23.6+ já entende TypeScript sozinho; aqui só falta achar o arquivo.)

import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SRC = new URL('../src/', import.meta.url);
const EXTENSOES = ['.ts', '.tsx', '/index.ts', '/index.tsx'];

function existente(url) {
  const caminho = fileURLToPath(url);
  if (/\.[cm]?[jt]sx?$/.test(caminho) && existsSync(caminho)) return url;
  for (const ext of EXTENSOES) if (existsSync(caminho + ext)) return pathToFileURL(caminho + ext).href;
  return null;
}

registerHooks({
  resolve(especificador, contexto, proximo) {
    if (especificador.startsWith('@/')) {
      const url = existente(new URL(especificador.slice(2), SRC).href);
      if (url) return proximo(url, contexto);
    }
    if ((especificador.startsWith('./') || especificador.startsWith('../')) && contexto.parentURL?.startsWith('file:')) {
      const url = existente(new URL(especificador, contexto.parentURL).href);
      if (url) return proximo(url, contexto);
    }
    return proximo(especificador, contexto);
  },
});

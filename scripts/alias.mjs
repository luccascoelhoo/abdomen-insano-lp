// Resolve o alias `@/` (tsconfig) para `src/` quando os scripts de checagem
// rodam direto no Node: `node --import ./scripts/alias.mjs scripts/checar-painel.mjs`.
import { register } from 'node:module';
register(
  'data:text/javascript,' +
    encodeURIComponent(`
      import { existsSync } from 'node:fs';
      const raiz = ${JSON.stringify(new URL('../src/', import.meta.url).href)};
      export async function resolve(esp, ctx, prox) {
        if (esp.startsWith('@/')) {
          const base = new URL(esp.slice(2), raiz);
          for (const ext of ['.ts', '.tsx', '/index.ts']) {
            const u = new URL(base.href + ext);
            if (existsSync(u)) return prox(u.href, ctx);
          }
        }
        if ((esp.startsWith('./') || esp.startsWith('../')) && !/[.](ts|tsx|js|mjs|json)$/.test(esp) && ctx.parentURL) {
          for (const ext of ['.ts', '.tsx', '/index.ts']) {
            const u = new URL(esp + ext, ctx.parentURL);
            if (existsSync(u)) return prox(u.href, ctx);
          }
        }
        return prox(esp, ctx);
      }
    `),
);

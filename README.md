# Nordil Premiações – Painel

Aplicação web para gestão de campanhas de incentivo e premiações.

## Tecnologias
- Vite + React + TypeScript
- Tailwind (UI) + Radix UI
- TanStack Query

## Scripts
- Desenvolvimento: `npm run dev`
- Build de produção: `npm run build`
- Pré-visualização local do build: `npm run preview`

Requisitos: Node 18+ e npm.

## Estrutura relevante
- `src/` código-fonte do painel
- `public/` estáticos (inclui `employees.json`, `gerentes-overrides.json`)
- `docs/` documentação (ex.: `aprovacoes-migration.md`)

Observação: pastas geradas (ex.: `dist/`) são ignoradas no versionamento e criadas pelo build.

## Deploy
### Netlify (recomendado)
- CI: conecte o repositório e aponte a branch (ex.: `main`).
- Build command: `npm run build`
- Publish directory: `dist`

Para publicar manualmente via CLI (opcional):
```powershell
npm run build
netlify deploy --prod --dir=dist --site <SITE_ID>
```

### Firebase Functions (opcional)
Caso você utilize Cloud Functions da pasta `functions/`, o deploy é separado:
```powershell
firebase deploy --only functions
```

## Dados auxiliares
- `public/employees.json`: base usada no autocomplete de colaboradores.
- `public/gerentes-overrides.json`: mapeamento de gerentes quando não encontrados no Firestore.

## Notas
- Removidos artefatos antigos da Lovable e dependências que não fazem parte do painel atual.

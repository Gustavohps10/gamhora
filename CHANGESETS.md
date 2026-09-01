# Guia de Publicação e Versionamento com Changesets

Este documento explica o fluxo simples e passo a passo para versionar e publicar pacotes do monorepo Mr-tick no **NPM** usando o **Changesets**.

---

## 🚀 Fluxo Rápido de Publicação (Passo a Passo)

### 1. Criar um Registro de Mudança (Changeset)

Após fazer alterações no código (ex: no `@mr-tick/sdk`), rode na raiz:

```bash
yarn changeset
```

1. **Selecione os pacotes alterados**: Use as setas do teclado e a barra de espaço para marcar (ex: `[x] @mr-tick/sdk`) e aperte `Enter`.
2. **Escolha o tipo de versão**:
   - `patch` (correções de bugs / melhorias internas).
   - `minor` (novas funcionalidades compatíveis).
   - `major` (mudanças que quebram compatibilidade).
3. **Escreva o resumo da mudança**: Digite a mensagem que aparecerá no `CHANGELOG.md`.

---

### 2. Aplicar o Bump de Versão e Atualizar o CHANGELOG

Na raiz, execute:

```bash
yarn changeset version
```

- Este comando atualiza automaticamente a versão no `package.json` dos pacotes afetados e gera/atualiza os arquivos `CHANGELOG.md`.

---

### 3. Fazer o Build do Monorepo

Gere a compilação atualizada antes de publicar:

```bash
yarn lint:fix; yarn build
```

---

### 4. Publicar no NPM

1. **Configurar o Token de Autenticação (Apenas na 1ª vez ou quando o token expirar)**:

   ```bash
   npm config set //registry.npmjs.org/:_authToken SEU_NPM_TOKEN_AQUI
   ```

2. **Executar a publicação**:

   ```bash
   yarn changeset publish
   ```

3. **Comitar e subir as tags no Git**:
   ```bash
   git add .
   git commit -m "chore(release): publish packages"
   git push --follow-tags
   ```

---

## 🔑 Como Gerar o Granular Access Token no NPM

Se precisar gerar um novo token de publicação:

1. Acesse: [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
2. Clique em **Generate New Token** ➔ **Granular Access Token**.
3. Preencha os campos:
   - **Token name**: `mr-tick-publisher`
   - **Packages and scopes**:
     - **Permissions**: `Read and write`
     - **Select packages**: `All packages` (ou escopo `@mr-tick`)
   - **Organizations**:
     - **Permissions**: `Read and write`
   - **Expiration Date**: Escolha a data de expiração desejada.
4. Clique em **Generate token** e copie o token gerado (`npm_...`).
5. Configure no terminal:
   ```bash
   npm config set //registry.npmjs.org/:_authToken npm_SEU_TOKEN_COPIADO
   ```

---

## 🛠️ Resumo de Comandos Úteis

| Comando                  | Descrição                                                         |
| :----------------------- | :---------------------------------------------------------------- |
| `yarn changeset`         | Cria um novo arquivo de changeset com as alterações feitas.       |
| `yarn changeset status`  | Mostra quais pacotes foram alterados e estão pendentes de versão. |
| `yarn changeset version` | Atualiza os `package.json` e gera os `CHANGELOG.md`.              |
| `yarn changeset publish` | Publica os pacotes no registro do NPM e cria tags no Git.         |

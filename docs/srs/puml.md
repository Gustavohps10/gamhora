# Guia de Manutenção de Diagramas PlantUML (PUML)

Este documento serve como guia de instrução para **desenvolvedores e IAs** sobre como criar, editar, organizar e sincronizar os diagramas de arquitetura e requisitos do projeto Metric.

---

## 🏗️ 1. Como Funciona a Automação (`yarn puml`)

O projeto possui um script em TypeScript ([puml.ts](../../puml.ts)) configurado no `package.json`:

```bash
yarn puml
```

### O que o script faz:
1. Varre recursivamente a pasta `docs/srs/diagrams/puml/`.
2. Comprime e envia o código PlantUML para a API oficial do PlantUML.
3. Baixa e salva os PNGs correspondentes em `docs/srs/diagrams/puml-images/<categoria>/`.
4. Varre o arquivo `docs/srs/software-requirements-specification.md` e substitui automaticamente o conteúdo entre as tags de bloco com as imagens geradas.

---

## 📁 2. Estrutura de Diretórios e Mapeamento de Blocos

| Pasta em `docs/srs/diagrams/puml/` | Tag de Início no Markdown | Tag de Fim no Markdown |
| :--- | :--- | :--- |
| `classes/` | `<!--<BEGIN_CLASSES_DIAGRAM> -->` | `<!--END_CLASSES_DIAGRAM -->` |
| `component/` | `<!--<BEGIN_COMPONENT_DIAGRAM> -->` | `<!--END_COMPONENT_DIAGRAM -->` |
| `flow/` | `<!--<BEGIN_FLOW> -->` | `<!--END_FLOW -->` |
| `infra/` | `<!--<BEGIN_INFRA_DIAGRAM> -->` | `<!--END_INFRA_DIAGRAM -->` |
| `integration/` | `<!--<BEGIN_INTEGRATION_DIAGRAM> -->` | `<!--END_INTEGRATION_DIAGRAM -->` |
| `uml/` | `<!--<BEGIN_UML_DIAGRAM> -->` | `<!--END_UML_DIAGRAM -->` |

---

## 🔢 3. Padrão de Nomenclatura e Numeração Sequencial

Todos os arquivos `.puml` **devem obrigatoriamente seguir a convenção de nomenclatura**:

```
diagram-<categoria>-<numero_3_digitos>-<nome-descritivo>.puml
```

### Exemplos:
- `docs/srs/diagrams/puml/classes/diagram-classes-001-tasks.puml`
- `docs/srs/diagrams/puml/classes/diagram-classes-002-timeEntries.puml`
- `docs/srs/diagrams/puml/flow/diagram-flow-001-timer.puml`

### ⚠️ Regra Crítica para IAs e Devs:
* **Sem buracos na numeração:** Se um diagrama for excluído, os diagramas subsequentes daquela pasta **devem ser renumerados** para manter a sequência `001`, `002`, `003`, etc.
* **Remoção de imagens órfãs:** Se deletar um arquivo `.puml`, lembre-se de deletar o `.png` antigo correspondente em `puml-images/` para evitar referências quebradas.

---

## ✍️ 4. Boas Práticas de Sintaxe PlantUML (Evitando Erros HTTP 400)

1. **Cabeçalho e Rodapé:**
   Todo arquivo deve começar com `@startuml <NomeDiagrama>` e terminar com `@enduml`.

2. **Cuidado com Aninhamento de Componentes:**
   * ❌ **Incorreto:**
     ```plantuml
     component [MeuComponente] {
         [subItem]
     }
     ```
   * ✅ **Correto:**
     ```plantuml
     component "MeuComponente" as Comp {
         component "SubItem" as Sub
     }
     ```

3. **Notas e Comentários:**
   * Sempre aponte notas para um componente específico:
     `note bottom of MeuComponente` ou `note right of App` (nunca `note right of node` solto).

---

## 🤖 5. Passo a Passo para a IA Atualizar Diagramas

Quando o usuário pedir para alterar, adicionar ou remover diagramas:

1. **Modifique/Crie os arquivos `.puml`:** Crie ou edite na pasta `docs/srs/diagrams/puml/<categoria>/`.
2. **Garanta a numeração sequencial:** Verifique se os arquivos de cada pasta estão em ordem (ex: `001`, `002`, `003`...).
3. **NÃO insira links de imagens manualmente no Markdown:** O script fará isso sozinho. Apenas certifique-se de que as tags `<!--<BEGIN_XXX> -->` e `<!--END_XXX -->` existem no `software-requirements-specification.md`.
4. **Execute o comando:**
   ```bash
   yarn puml
   ```
5. **Verifique o output:** Certifique-se de que o script finalizou com `✨ Todos os diagramas processados e Markdown atualizado!`.

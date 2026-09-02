import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const initialContent = `
  # Título Nível 1
  ## Título Nível 2
  ### Título Nível 3

  > Este é um bloco de citação.

  **Texto em negrito**

  *Texto em itálico*

  [Link Exemplo](https://exemplo.com)

  - Item de lista não ordenada
  1. Item de lista ordenada
`

export function Notes() {
  // Inicializa o editor com o conteúdo obtido
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
  })

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center p-6">
      <div
        className="prose lg:prose-xl text-foreground border bg-zinc-50 p-16 shadow-md dark:bg-zinc-900"
        style={{ width: '793.7px', minHeight: '1122.5px' }}
      >
        {/* Renderiza o conteúdo do editor */}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

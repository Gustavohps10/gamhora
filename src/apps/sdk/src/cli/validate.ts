import fs from 'fs'
import path from 'path'

import { AddonConfig } from '../AddonConfig'
import { AddonCategory, VALID_ADDON_CATEGORIES } from '../contracts/manifest'
import { readYaml } from '../utils/yaml'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function validateAddon(addonDir: string): ValidationResult {
  const rootDir = path.resolve(addonDir)
  const manifestPath = path.join(rootDir, 'manifest.yaml')
  const errors: string[] = []
  const warnings: string[] = []

  if (!fs.existsSync(manifestPath)) {
    return {
      valid: false,
      errors: [`Arquivo manifest.yaml não encontrado em: ${rootDir}`],
      warnings: [],
    }
  }

  const manifest: AddonConfig = readYaml(manifestPath)

  const id = manifest.id || manifest.AddonId
  if (!id || typeof id !== 'string' || !id.trim()) {
    errors.push('Campo "id" é obrigatório no manifest.yaml.')
  } else if (!/^[a-z0-9-_@/]+$/i.test(id.trim())) {
    errors.push(
      `ID "${id}" inválido. Use apenas letras, números, traços e underlines.`,
    )
  }

  const name = manifest.name || manifest.Name
  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Campo "name" é obrigatório.')
  }

  const version = manifest.version || manifest.Version
  if (!version || typeof version !== 'string' || !version.trim()) {
    errors.push('Campo "version" é obrigatório.')
  } else if (!/^\d+\.\d+\.\d+/.test(version)) {
    errors.push(`Versão "${version}" não segue o padrão SemVer (ex: 1.0.0).`)
  }

  const normalizeCategory = (cat: string): AddonCategory => {
    const lower = cat.toLowerCase()
    if (lower.includes('datasource')) return 'dataSource'
    if (lower.includes('watcher')) return 'watcher'
    if (lower.includes('calendar')) return 'calendar'
    if (lower.includes('punch')) return 'punch'
    return cat as AddonCategory
  }

  const rawCategories =
    manifest.categories ||
    manifest.Categories ||
    (manifest.category || manifest.Category
      ? [manifest.category || manifest.Category]
      : [])

  const categories: AddonCategory[] = Array.isArray(rawCategories)
    ? rawCategories.map((c) => normalizeCategory(String(c)))
    : []

  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    errors.push(
      `Campo "categories" é obrigatório. Deve conter ao menos uma categoria: ${VALID_ADDON_CATEGORIES.join(', ')}`,
    )
  } else {
    for (const cat of categories) {
      if (!VALID_ADDON_CATEGORIES.includes(cat)) {
        errors.push(
          `Categoria inválida "${cat}". Categorias válidas são: ${VALID_ADDON_CATEGORIES.join(', ')}`,
        )
      }
    }
  }

  const author = manifest.author || manifest.Author
  if (!author || typeof author !== 'string' || !author.trim()) {
    errors.push('Campo "author" é obrigatório.')
  }

  const shortDescription =
    manifest.shortDescription || manifest.ShortDescription
  if (
    !shortDescription ||
    typeof shortDescription !== 'string' ||
    !shortDescription.trim()
  ) {
    warnings.push('Recomendado preencher "shortDescription" para a listagem.')
  }

  const description = manifest.description || manifest.Description
  if (!description || typeof description !== 'string' || !description.trim()) {
    warnings.push('Recomendado preencher "description" com detalhes do plugin.')
  }

  if (manifest.screenshots && Array.isArray(manifest.screenshots)) {
    manifest.screenshots.forEach((s, idx) => {
      if (!s.url || !/^https?:\/\//i.test(s.url)) {
        errors.push(
          `Screenshot #${idx + 1} deve conter uma URL válida começando com http:// ou https://`,
        )
      }
    })
  }

  if (manifest.downloadUrl && !/^https?:\/\//i.test(manifest.downloadUrl)) {
    errors.push(
      'Campo "downloadUrl" deve ser uma URL pública válida (http:// ou https://).',
    )
  }

  // Check build files
  const distDir = path.join(rootDir, 'dist')
  if (!fs.existsSync(distDir)) {
    warnings.push(
      'Diretório dist/ não encontrado. Execute o build antes de empacotar o plugin.',
    )
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

export function runValidationCommand(addonDir: string) {
  console.log(`\n🔍 Validando manifesto do plugin em: ${addonDir}\n`)
  const result = validateAddon(addonDir)

  if (result.warnings.length > 0) {
    console.log('⚠️ Avisos:')
    result.warnings.forEach((w) => console.log(`   - ${w}`))
    console.log('')
  }

  if (!result.valid) {
    console.log('❌ Erros de validação encontrados:')
    result.errors.forEach((e) => console.log(`   - ${e}`))
    console.log('\nCorrija os erros acima antes de empacotar o plugin.\n')
    process.exit(1)
  } else {
    console.log(
      '✅ Manifesto validado com sucesso! Nenhuma pendência encontrada.\n',
    )
  }
}

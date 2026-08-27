import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'

import { IAddonManifest } from '../contracts/manifest'
import { readYaml } from '../utils/yaml'

export function printPrSnippet(addonDir: string) {
  const rootDir = path.resolve(addonDir)
  const manifestPath = path.join(rootDir, 'manifest.yaml')

  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ manifest.yaml não encontrado em: ${rootDir}`)
    process.exit(1)
  }

  const manifest = readYaml(manifestPath) as Partial<IAddonManifest>
  const filename = `${manifest.id || 'plugin'}.yaml`
  const targetPath = `addons/${filename}`

  console.log(`\n======================================================`)
  console.log(`  📄 YAML PARA PULL REQUEST EM: gamhora/addons-manifest`)
  console.log(`  Destino: ${targetPath}`)
  console.log(`======================================================\n`)

  const yamlContent = yaml.dump(manifest, { indent: 2, lineWidth: -1 })
  console.log(yamlContent)
  console.log(`======================================================\n`)
}

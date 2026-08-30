import fs from 'fs'
import yaml from 'js-yaml'

export function writeYaml(file: string, content: object) {
  const yamlStr = yaml.dump(content, { lineWidth: -1, noRefs: true })
  fs.writeFileSync(file, yamlStr, 'utf-8')
}

export function readYaml<T = any>(file: string): T {
  if (!fs.existsSync(file)) return {} as T
  return (yaml.load(fs.readFileSync(file, 'utf-8')) || {}) as T
}

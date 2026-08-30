import { program } from 'commander'
import inquirer from 'inquirer'

import { runInitWizard } from './init'
import { runManifestWizard } from './manifest'
import { buildAddon } from './pkg'
import { printPrSnippet } from './prSnippet'
import { syncManifest } from './sync'
import { runValidationCommand } from './validate'

program
  .name('pandhora')
  .description('CLI do Pandhora SDK para criar, validar e empacotar plugins')
  .version(__SDK_VERSION__)

program
  .command('init [name]')
  .description(
    'Inicializa um novo projeto de plugin com TypeScript e boilerplates',
  )
  .action(async (name?: string) => {
    await runInitWizard(name)
  })

program
  .command('manifest [addonDir]')
  .description('Cria ou atualiza interativamente o manifest.yaml do plugin')
  .action(async (addonDir = '.') => {
    await runManifestWizard(addonDir)
  })

program
  .command('sync [addonDir]')
  .alias('sync:manifest')
  .description(
    'Sincroniza capturas de tela, ícones e URLs dinâmicas no manifest.yaml',
  )
  .action((addonDir = '.') => {
    syncManifest(addonDir)
  })

program
  .command('validate [addonDir]')
  .description('Valida o manifest.yaml e a estrutura de arquivos do plugin')
  .action((addonDir = '.') => {
    runValidationCommand(addonDir)
  })

program
  .command('pack [addonDir]')
  .alias('pkg')
  .description('Empacota o plugin em formato .tladdon e atualiza o manifesto')
  .option('--download-url <url>', 'URL pública de download do pacote .tladdon')
  .option('--changelog <items...>', 'Notas e mudanças desta versão')
  .action(async (addonDir = '.', options) => {
    let downloadUrl = options.downloadUrl

    if (!downloadUrl) {
      const answer = await inquirer.prompt({
        type: 'input',
        name: 'downloadUrl',
        message:
          'URL pública de download do arquivo .tladdon (GitHub Release asset):',
      })
      downloadUrl = answer.downloadUrl
    }

    buildAddon(addonDir, {
      apiVersion: __SDK_VERSION__,
      downloadUrl,
      changelog: options.changelog,
    })
  })

program
  .command('pr-snippet [addonDir]')
  .description(
    'Exibe o YAML formatado para submeter o Pull Request no repositório de manifestos',
  )
  .action((addonDir = '.') => {
    printPrSnippet(addonDir)
  })

program.parse(process.argv)

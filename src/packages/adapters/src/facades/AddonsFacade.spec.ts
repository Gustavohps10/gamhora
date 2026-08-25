import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'

import { AddonsFacade } from './AddonsFacade'

vi.mock('axios')

describe('AddonsFacade', () => {
  it('should parse unified manifest YAML correctly', async () => {
    const facade = new AddonsFacade()
    const yamlContent = `
id: metric-datasource-redmine
name: Redmine Integration
version: 1.0.0
categories:
  - dataSource
author: Metric Community
shortDescription: Integração com Redmine
description: Plugin completo do Redmine
iconUrl: https://example.com/icon.png
sourceUrl: https://github.com/metric-org/addon-redmine
screenshots:
  - url: https://example.com/screen1.png
    caption: Tela 1
downloadUrl: https://example.com/redmine-1.0.0.tladdon
requiredApiVersion: '>=1.0.0'
releaseDate: '2026-08-24'
changelog:
  - Suporte a tarefas
`
    const result = await facade.parseManifest(yamlContent)

    expect(result.isSuccess()).toBe(true)
    if (result.isSuccess()) {
      expect(result.success.id).toBe('metric-datasource-redmine')
      expect(result.success.name).toBe('Redmine Integration')
      expect(result.success.categories).toEqual(['dataSource'])
      expect(result.success.screenshots).toHaveLength(1)
      expect(result.success.screenshots?.[0].caption).toBe('Tela 1')
      expect(result.success.downloadUrl).toBe(
        'https://example.com/redmine-1.0.0.tladdon',
      )
    }
  })

  it('should maintain backward compatibility with legacy PascalCase manifests', async () => {
    const facade = new AddonsFacade()
    const legacyYaml = `
AddonId: metric-legacy
Name: Legacy Addon
Version: 0.9.0
Author: Legacy Dev
Description: Legacy description
Category: DataSources
IconUrl: https://example.com/legacy.png
`
    const result = await facade.parseManifest(legacyYaml)

    expect(result.isSuccess()).toBe(true)
    if (result.isSuccess()) {
      expect(result.success.id).toBe('metric-legacy')
      expect(result.success.name).toBe('Legacy Addon')
      expect(result.success.version).toBe('0.9.0')
      expect(result.success.creator).toBe('Legacy Dev')
      expect(result.success.category).toBe('DataSources')
      expect(result.success.logo).toBe('https://example.com/legacy.png')
    }
  })

  it('should fetch available addons in a single HTTP request without N+1', async () => {
    const facade = new AddonsFacade()
    const mockConsolidatedCatalog = [
      {
        id: 'metric-datasource-redmine',
        name: 'Redmine',
        version: '1.0.0',
        categories: ['dataSource'],
        author: 'Community',
        description: 'Redmine plugin',
        downloadUrl: 'https://example.com/redmine.tladdon',
      },
      {
        id: 'metric-watcher-discord',
        name: 'Discord Presence',
        version: '1.0.0',
        categories: ['watcher'],
        author: 'Metric',
        description: 'Discord watcher',
        downloadUrl: 'https://example.com/discord.tladdon',
      },
    ]

    vi.mocked(axios.get).mockResolvedValueOnce({
      data: mockConsolidatedCatalog,
    })

    const result = await facade.listAvailable()

    expect(result.isSuccess()).toBe(true)
    expect(axios.get).toHaveBeenCalledTimes(1)
    if (result.isSuccess()) {
      expect(result.success).toHaveLength(2)
      expect(result.success[0].id).toBe('metric-datasource-redmine')
      expect(result.success[0].downloadUrl).toBe(
        'https://example.com/redmine.tladdon',
      )
      expect(result.success[1].id).toBe('metric-watcher-discord')
    }
  })
})

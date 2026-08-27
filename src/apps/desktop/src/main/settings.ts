import { AppSettings } from '@gamhora/application'
import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

function getSettingsPath() {
  return join(app.getPath('userData'), 'settings.json')
}

export function getSettings(): AppSettings {
  try {
    const settingsPath = getSettingsPath()
    if (existsSync(settingsPath)) {
      return JSON.parse(readFileSync(settingsPath, 'utf8'))
    }
  } catch {}
  return {}
}

export function saveSettings(settings: AppSettings): void {
  try {
    const settingsPath = getSettingsPath()
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
  } catch {}
}

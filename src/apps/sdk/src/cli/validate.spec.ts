import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import { validateAddon } from './validate'

describe('validateAddon', () => {
  it('should validate valid manifest without errors', () => {
    // datasource-fake test
    const fakeDir = path.resolve(process.cwd(), 'src/tests/datasource-fake')
    if (fs.existsSync(fakeDir)) {
      const result = validateAddon(fakeDir)
      expect(result.errors).toEqual([])
      expect(result.valid).toBe(true)
    }
  })
})

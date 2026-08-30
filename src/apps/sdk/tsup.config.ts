import { defineConfig } from 'tsup'

import pkg from './package.json'

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: {
      resolve: true,
    },
    clean: true,
    sourcemap: true,
    splitting: false,
    tsconfig: './tsconfig.build.json',
    noExternal: [
      '@pandhora/application',
      '@pandhora/shared',
      '@pandhora/domain',
    ],
    define: {
      __SDK_VERSION__: JSON.stringify(pkg.version),
    },
  },
  {
    entry: {
      cli: 'src/cli/index.ts',
    },
    format: ['cjs'],
    banner: {
      js: '#!/usr/bin/env node',
    },
    target: 'node18',
    platform: 'node',
    dts: false,
    sourcemap: true,
    splitting: false,
    tsconfig: './tsconfig.build.json',
    noExternal: [
      '@pandhora/application',
      '@pandhora/shared',
      '@pandhora/domain',
      'commander',
      'inquirer',
      'js-yaml',
      'adm-zip',
    ],
    define: {
      __SDK_VERSION__: JSON.stringify(pkg.version),
    },
  },
])

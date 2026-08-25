// @ts-nocheck
import { server } from 'fumadocs-mdx/runtime/server'

import { default as __fd_glob_1 } from '../content/docs/apis/meta.json?collection=docs'
import * as __fd_glob_12 from '../content/docs/apis/oauth-pkce.mdx?collection=docs'
import * as __fd_glob_13 from '../content/docs/apis/storage-and-events.mdx?collection=docs'
import * as __fd_glob_6 from '../content/docs/categories/calendars.mdx?collection=docs'
import * as __fd_glob_7 from '../content/docs/categories/datasources.mdx?collection=docs'
import * as __fd_glob_8 from '../content/docs/categories/index.mdx?collection=docs'
import { default as __fd_glob_2 } from '../content/docs/categories/meta.json?collection=docs'
import * as __fd_glob_9 from '../content/docs/categories/punch.mdx?collection=docs'
import * as __fd_glob_10 from '../content/docs/categories/themes.mdx?collection=docs'
import * as __fd_glob_11 from '../content/docs/categories/watchers.mdx?collection=docs'
import * as __fd_glob_3 from '../content/docs/index.mdx?collection=docs'
import { default as __fd_glob_0 } from '../content/docs/meta.json?collection=docs'
import * as __fd_glob_4 from '../content/docs/quickstart.mdx?collection=docs'
import * as __fd_glob_5 from '../content/docs/sync-engine.mdx?collection=docs'
import type * as Config from '../source.config'

const create = server<
  typeof Config,
  import('fumadocs-mdx/runtime/types').InternalTypeConfig & {
    DocData: {}
  }
>()

export const docs = await create.docs(
  'docs',
  'content/docs',
  {
    'meta.json': __fd_glob_0,
    'apis/meta.json': __fd_glob_1,
    'categories/meta.json': __fd_glob_2,
  },
  {
    'index.mdx': __fd_glob_3,
    'quickstart.mdx': __fd_glob_4,
    'sync-engine.mdx': __fd_glob_5,
    'categories/calendars.mdx': __fd_glob_6,
    'categories/datasources.mdx': __fd_glob_7,
    'categories/index.mdx': __fd_glob_8,
    'categories/punch.mdx': __fd_glob_9,
    'categories/themes.mdx': __fd_glob_10,
    'categories/watchers.mdx': __fd_glob_11,
    'apis/oauth-pkce.mdx': __fd_glob_12,
    'apis/storage-and-events.mdx': __fd_glob_13,
  },
)

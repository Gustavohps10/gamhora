// @ts-nocheck
import { server } from 'fumadocs-mdx/runtime/server'

import * as __fd_glob_1 from '../content/docs/calendars.mdx?collection=docs'
import * as __fd_glob_2 from '../content/docs/categories.mdx?collection=docs'
import * as __fd_glob_3 from '../content/docs/datasources.mdx?collection=docs'
import * as __fd_glob_4 from '../content/docs/index.mdx?collection=docs'
import { default as __fd_glob_0 } from '../content/docs/meta.json?collection=docs'
import * as __fd_glob_5 from '../content/docs/oauth-pkce.mdx?collection=docs'
import * as __fd_glob_6 from '../content/docs/punch.mdx?collection=docs'
import * as __fd_glob_7 from '../content/docs/quickstart.mdx?collection=docs'
import * as __fd_glob_8 from '../content/docs/storage-and-events.mdx?collection=docs'
import * as __fd_glob_9 from '../content/docs/watchers.mdx?collection=docs'
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
  { 'meta.json': __fd_glob_0 },
  {
    'calendars.mdx': __fd_glob_1,
    'categories.mdx': __fd_glob_2,
    'datasources.mdx': __fd_glob_3,
    'index.mdx': __fd_glob_4,
    'oauth-pkce.mdx': __fd_glob_5,
    'punch.mdx': __fd_glob_6,
    'quickstart.mdx': __fd_glob_7,
    'storage-and-events.mdx': __fd_glob_8,
    'watchers.mdx': __fd_glob_9,
  },
)

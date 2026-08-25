// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser'

import type * as Config from '../source.config'

const create = browser<
  typeof Config,
  import('fumadocs-mdx/runtime/types').InternalTypeConfig & {
    DocData: {}
  }
>()
const browserCollections = {
  docs: create.doc('docs', {
    'index.mdx': () => import('../content/docs/index.mdx?collection=docs'),
    'quickstart.mdx': () =>
      import('../content/docs/quickstart.mdx?collection=docs'),
    'sync-engine.mdx': () =>
      import('../content/docs/sync-engine.mdx?collection=docs'),
    'apis/oauth-pkce.mdx': () =>
      import('../content/docs/apis/oauth-pkce.mdx?collection=docs'),
    'apis/storage-and-events.mdx': () =>
      import('../content/docs/apis/storage-and-events.mdx?collection=docs'),
    'categories/calendars.mdx': () =>
      import('../content/docs/categories/calendars.mdx?collection=docs'),
    'categories/datasources.mdx': () =>
      import('../content/docs/categories/datasources.mdx?collection=docs'),
    'categories/index.mdx': () =>
      import('../content/docs/categories/index.mdx?collection=docs'),
    'categories/punch.mdx': () =>
      import('../content/docs/categories/punch.mdx?collection=docs'),
    'categories/themes.mdx': () =>
      import('../content/docs/categories/themes.mdx?collection=docs'),
    'categories/watchers.mdx': () =>
      import('../content/docs/categories/watchers.mdx?collection=docs'),
  }),
}
export default browserCollections

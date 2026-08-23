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
    'calendars.mdx': () =>
      import('../content/docs/calendars.mdx?collection=docs'),
    'categories.mdx': () =>
      import('../content/docs/categories.mdx?collection=docs'),
    'datasources.mdx': () =>
      import('../content/docs/datasources.mdx?collection=docs'),
    'index.mdx': () => import('../content/docs/index.mdx?collection=docs'),
    'oauth-pkce.mdx': () =>
      import('../content/docs/oauth-pkce.mdx?collection=docs'),
    'punch.mdx': () => import('../content/docs/punch.mdx?collection=docs'),
    'quickstart.mdx': () =>
      import('../content/docs/quickstart.mdx?collection=docs'),
    'storage-and-events.mdx': () =>
      import('../content/docs/storage-and-events.mdx?collection=docs'),
    'watchers.mdx': () =>
      import('../content/docs/watchers.mdx?collection=docs'),
  }),
}
export default browserCollections

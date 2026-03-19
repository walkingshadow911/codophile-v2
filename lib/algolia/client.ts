/* eslint-disable @typescript-eslint/no-var-requires */

const algoliaModule = require("algoliasearch");
// import {algoliaModule} from "algoliasearch";

const algoliasearch =
  algoliaModule.default ??
  algoliaModule.algoliasearch ??
  algoliaModule;

// Lazy-initialize the Algolia admin client to avoid crashing during
// `next build` when ALGOLIA_ADMIN_KEY is not yet available.
let _algoliaClient: ReturnType<typeof algoliasearch> | null = null;

export function getAlgoliaClient() {
  if (!_algoliaClient) {
    _algoliaClient = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
      process.env.ALGOLIA_ADMIN_KEY
    );
  }
  return _algoliaClient;
}

export const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME!;
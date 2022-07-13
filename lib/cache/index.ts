import NodeCache from 'node-cache'

let cacheManagerInstance: NodeCache

export function getCacheManager() {
  if (cacheManagerInstance) {
    return cacheManagerInstance
  }

  cacheManagerInstance = new NodeCache({
    stdTTL: 60 * 60 * 1, // 1 hour
    checkperiod: 60 * 60,
    useClones: false,
    enableLegacyCallbacks: false,
  })

  return cacheManagerInstance
}

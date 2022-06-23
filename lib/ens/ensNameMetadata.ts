import axios from 'axios'
import { CID } from 'multiformats/cid'

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/'

function getIPFSGateway(ipfsUri: string) {
  if (ipfsUri.startsWith('ipfs://ipfs/')) {
    return ipfsUri.replace('ipfs://ipfs/', IPFS_GATEWAY)
  } else if (ipfsUri.startsWith('ipfs://')) {
    return ipfsUri.replace('ipfs://', IPFS_GATEWAY)
  } else if (ipfsUri.startsWith('ipfs/')) {
    return ipfsUri.replace('ipfs/', IPFS_GATEWAY)
  } else if (isCID(ipfsUri)) {
    return `${IPFS_GATEWAY}${ipfsUri}`
  }

  return ipfsUri
}

export interface ENSMetadata {
  uri: string
  host_meta: {
    chain_id: number
    namespace: string
    contract_address: string
    token_id: string
    reference_url: string
  }
  is_owner: boolean
  description: string
  image: string
  name: string
}

export interface UseENSMetadataResult {
  loading: boolean
  data?: ENSMetadata
}

export function isCID(hash: string) {
  try {
    if (typeof hash === 'string') {
      return Boolean(CID.parse(hash))
    }
    return Boolean(CID.asCID(hash))
  } catch (e) {
    return false
  }
}

export function getENSNameMetadata(ensName: string): Promise<ENSMetadata> {
  return axios
    .get<ENSMetadata>(
      `https://metadata.ens.domains/mainnet/avatar/${ensName}/meta`,
    )
    .then(({ data }) => {
      if ('image' in data && data.image) {
        data.image = getIPFSGateway(data.image)
      }
      return data
    })
}

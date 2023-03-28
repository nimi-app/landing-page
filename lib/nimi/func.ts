// eslint-disable-next-line import/no-unresolved
import { utils } from 'ethers'
import { decodeContenthash } from '@ensdomains/ensjs/utils/contentHash'
import { Nimi, NimiLinkType } from '@nimi.io/card/types'
import axios from 'axios'
import * as isIPFS from 'is-ipfs'

const { namehash } = utils

const supportedKeys = [
  'com.twitter',
  'com.github',
  'com.facebook',
  'com.linkedin',
  'com.instagram',
  'com.discord',
  'org.telegram',
  'email',
  'url',
  'description',
]

export function getNimiLinkFromENSText(text: string): NimiLinkType | undefined {
  if (supportedKeys.includes(text.toLowerCase())) {
    if (text.toLowerCase() === 'email') {
      return NimiLinkType.EMAIL
    }

    if (text.toLowerCase() === 'url') {
      return NimiLinkType.URL
    }

    console.log('text', text)

    return text.split('.')[1]?.toLocaleUpperCase() as NimiLinkType
  }
}

/**
 * Custom domains to ENS names map
 */
const CUSTOM_DNS_TO_ENS_NAME: Record<string, string> = {
  'nimi.link': 'nimi.eth',
  'dvve.link': 'dvve.eth',
  'james.link': 'james.eth',
  'nick.link': 'nick.eth',
  'adamazad.link': 'adamazad.eth',
  'zett.link': 'zett.eth',
}

/**
 * Returns the custom domain from the dnsHost.
 * This is used to get the ENS name from the custom domain
 * @param dnsHost - dnsHost from the HTTP request
 * @returns
 */
export function getCustomDomain(dnsHost?: string) {
  dnsHost = dnsHost?.toLowerCase().split(':')[0]

  if (
    !dnsHost ||
    dnsHost.endsWith('.eth.limo') ||
    dnsHost.endsWith('.eth.link') ||
    dnsHost === 'localhost'
  ) {
    return null
  }

  console.log({
    dnsHost,
  })

  const domain = dnsHost?.split(':')[0]
  return domain
}

/**
 * Returns the current Nimi by domain name
 * @param domain
 * @returns
 */
export async function getNimiByDomain(domain: string) {
  try {
    const domainNamehash = namehash(domain)

    const nimiNameData = await axios
      .get<{
        data: {
          contenthash?: string
        }
      }>(`https://api.nimi.id/domains/${domainNamehash}`)
      .then((res) => res.data.data)

    console.log({
      domainNamehash,
      nimiNameData,
    })

    if (!nimiNameData.contenthash) {
      return
    }

    // Attempt to decode the content hash
    const decodeContenthashResult = isIPFS.cid(nimiNameData.contenthash)
      ? { decoded: nimiNameData.contenthash }
      : decodeContenthash(
          nimiNameData.contenthash.startsWith('0x')
            ? nimiNameData.contenthash
            : `0x${nimiNameData.contenthash}`,
        )

    const decoded: string | undefined = decodeContenthashResult.decoded
    // const protocolType: string | null | undefined = decodeContenthashResult.protocolType

    // Fetch all snapshots of the Nimi
    const nimiSnapshots = await axios
      .get<{
        data: any[]
      }>(`https://api.nimi.io/v2.0/nimi/by`, {
        params: {
          cid: decoded,
        },
      })
      .then((res) => res.data.data)

    if (nimiSnapshots.length > 0) {
      // Get the latest snapshot
      const [latestSnapshot] = nimiSnapshots
      return latestSnapshot.nimi as Nimi
    }
  } catch (e) {
    console.log(e)
    return
  }
}

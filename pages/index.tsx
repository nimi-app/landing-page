import { AddressZero } from '@ethersproject/constants'
import {
  Nimi,
  NimiLinkType,
  NimiLinkBaseDetails,
  NimiWidgetType,
  NimiImageType,
  NimiThemeType,
} from '@nimi.io/card/types'
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next'

import { getENSNameMetadata } from 'lib/ens/ensNameMetadata'
import { getENSProfile } from 'lib/ens/ensProfile'
import { getCacheManager } from 'lib/cache'
import {
  getCustomDomain,
  getNimiByDomain,
  getNimiLinkFromENSText,
} from 'lib/nimi/func'
import { NimiPageRenderer } from 'lib/nimi/renderer'
import createDebug from 'debug'

const debug = createDebug('page:index')

export default function IndexPage({
  nimi,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <NimiPageRenderer nimi={nimi} />
}

export async function getServerSideProps({
  req,
  query,
  res,
}: GetServerSidePropsContext<{
  ens: string
}>): Promise<{ props: { nimi: Nimi } }> {
  // Cache pages for  hour
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  )

  // Get ENS name from query
  let ensName: string = ((query.ens as string) || 'nimi.eth').toLowerCase()

  const customENSDomain = getCustomDomain(req.headers.host)
  // Attempt to find the custom ENS domain
  if (customENSDomain !== null) {
    ensName = customENSDomain
    const domainNimi = await getNimiByDomain(ensName)
    if (domainNimi) {
      return {
        props: {
          nimi: domainNimi,
        },
      }
    }
  }

  const nimiCacheKey = ensName
  const cacheManager = getCacheManager()

  const cachedNimi = await cacheManager.get<Nimi>(nimiCacheKey)
  if (cachedNimi) {
    debug('Using cached Nimi for ', ensName)
    return {
      props: {
        nimi: cachedNimi,
      },
    }
  }

  debug(`fetching ENS profile for ${ensName}`)
  const ensProfile = await getENSProfile(ensName)

  debug(`fetching ENS name metadata for ${ensName}`)
  const ensMetadata = await getENSNameMetadata(ensName).catch((error) => {
    console.error('getENSNameMetadata: ', error.message)
  })

  debug(`fetching ENS profile for ${ensName} complete`, {
    ensProfile,
    ensMetadata,
  })

  const ensAddress = ensProfile?.owner?.address ?? AddressZero
  let description: undefined | string = undefined
  const links: NimiLinkBaseDetails[] = []

  ensProfile.texts.forEach(({ text, value }) => {
    const nimiLinkType = getNimiLinkFromENSText(text)

    if (nimiLinkType) {
      // Add `https://` to URL if it doesn't have it
      if (nimiLinkType === NimiLinkType.URL && !value.startsWith('http')) {
        value = `https://${value}`
      }

      links.push({
        type: nimiLinkType,
        content: value,
      })
    } else if (text.toLowerCase() === 'description') {
      description = value
    }
  })

  const nimi: Nimi = {
    ensName,
    displayName: ensName,
    addresses: [],
    ensAddress,
    links,
    widgets: [
      {
        type: NimiWidgetType.POAP,
        context: {},
      },
    ],
    theme: {
      type: NimiThemeType.NIMI,
    },
    isLanding: true,
  }

  if (ensMetadata) {
    //
    if (ensMetadata.host_meta && ensMetadata.host_meta.contract_address) {
      nimi.image = {
        type: NimiImageType.ERC721,
        contract: ensMetadata.host_meta.contract_address,
        tokenId: ensMetadata.host_meta.token_id as any,
        tokenUri: ensMetadata.uri,
        url: ensMetadata.image,
      }
    } else {
      nimi.image = {
        type: NimiImageType.URL,
        url: ensMetadata.image,
      }
    }
  }

  if (description) {
    nimi.description = description
  }

  cacheManager.set(nimiCacheKey, nimi, 60 * 60)

  return {
    props: {
      nimi,
    },
  }
}

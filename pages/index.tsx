import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next'
import Head from 'next/head'
import {
  Container as NimiCardContainer,
  Nimi,
  NimiCard,
  NimiLinkType,
  NimiLinkBaseDetails,
  NimiWidgetType,
} from '@nimi.io/card'
import { MetaTags } from '../components/MetaTags/MetaTags'
import { getENSNameMetadata } from '../lib/ens/ensNameMetadata'
import { getENSProfile } from '../lib/ens/ensProfile'

import metaTagsImageUrl from '../assets/images/page-cover.png'
import { getCacheManager } from '../lib/cache'
import dynamic from 'next/dynamic'

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

// document.body is undefined in SSR
const NimiCardApp = dynamic(
  async () => {
    const NimiCardModule = await import('@nimi.io/card')

    return NimiCardModule.CardApp
  },
  { ssr: false }
)

function getNimiLinkFromENSText(text: string): NimiLinkType | undefined {
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

function Home({
  nimi,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const title = `${nimi.ensName} - Nimi`

  return (
    <>
      <Head>
        <title>{title}</title>
        <MetaTags
          title={title}
          description='Created using Nimi'
          imageUrl={metaTagsImageUrl.src}
          url={`https://${nimi.ensName}.limo/`}
        />
      </Head>
      <NimiCardContainer>
        <NimiCardApp nimi={nimi} />
      </NimiCardContainer>
    </>
  )
}

export async function getServerSideProps({
  query,
  res,
}: GetServerSidePropsContext<{
  ens: string
}>): Promise<{ props: { nimi: Nimi } }> {
  // Cache pages for 1 hour
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  )

  const ensName: string = ((query.ens as string) || 'nimi.eth').toLowerCase()
  const ensNameCacheKey = ensName

  const cacheManager = getCacheManager()

  const cachedNimi = await cacheManager.get<Nimi>(ensNameCacheKey)
  if (cachedNimi) {
    console.log('Using cached Nimi for ', ensName)
    return {
      props: {
        nimi: cachedNimi,
      },
    }
  }

  console.log(`fetching ENS profile for ${ensName}`)
  const ensProfile = await getENSProfile(ensName)

  console.log(`fetching ENS name metadata for ${ensName}`)
  const ensMetadata = await getENSNameMetadata(ensName).catch((error) => {
    console.error('getENSNameMetadata: ', error.message)
  })

  console.log(`fetching ENS profile for ${ensName} complete`, {
    ensProfile,
    ensMetadata,
  })

  const ensAddress =
    ensProfile?.owner?.address ?? '0x0000000000000000000000000000000000000000'
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
        address: ensAddress,
      },
    ],
    isLanding: true,
  }

  if (ensMetadata) {
    nimi.displayImageUrl = ensMetadata.image
  }

  if (description) {
    nimi.description = description
  }

  cacheManager.set(ensNameCacheKey, nimi, 60 * 60)

  return {
    props: {
      nimi,
    },
  }
}

export default Home

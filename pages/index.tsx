import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next'
import Head from 'next/head'
import {
  Container as NimiCardContainer,
  Nimi,
  NimiCard,
  NimiLink,
  NimiLinkBaseDetails,
  NimiWidgetType,
} from 'nimi-card'
import { MetaTags } from '../components/MetaTags/MetaTags'
import { getENSNameMetadata } from '../lib/ens/ensNameMetadata'
import { getENSProfile } from '../lib/ens/ensProfile'

import metaTagsImageUrl from '../assets/images/page-cover.png'

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

function getNimiLinkFromENSText(text: string): NimiLink | undefined {
  if (supportedKeys.includes(text.toLowerCase())) {
    if (text.toLowerCase() === 'email') {
      return 'email'
    }

    if (text.toLowerCase() === 'url') {
      return 'website'
    }

    return text.split('.')[1] as NimiLink
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
        <NimiCard nimi={nimi} />
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

  const ensName: string = (query.ens as string) || 'nimi.eth'
  const ensProfile = await getENSProfile(ensName)
  const ensMetadata = await getENSNameMetadata(ensName).catch((error) => {
    console.error(error.message)
  })

  const ensAddress =
    ensProfile?.owner?.address ?? '0x0000000000000000000000000000000000000000'
  let description: undefined | string = undefined
  const links: NimiLinkBaseDetails[] = []

  ensProfile.texts.forEach(({ text, value }) => {
    const nimiLinkType = getNimiLinkFromENSText(text)

    if (nimiLinkType) {
      const link = {
        type: nimiLinkType,
        url: value,
      }
      links.push(link)
    } else if (text.toLowerCase() === 'description') {
      description = value
    }
  })

  const nimi: Nimi = {
    ensName,
    landingPage:true,
    displayName: ensName,
    addresses: [
      {
        address: ensAddress,
        blockchain: 'ethereum',
      },
    ],
    ensAddress,
    links,
    widgets: [
      {
        type: NimiWidgetType.POAP,
        address: ensAddress,
      },
    ],
  }

  if (ensMetadata) {
    nimi.displayImageUrl = ensMetadata.image
  }

  if (description) {
    nimi.description = description
  }

  return {
    props: {
      nimi,
    },
  }
}

export default Home

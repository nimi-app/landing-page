import { Nimi } from '@nimi.io/card/types'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { MetaTags } from 'components/MetaTags/MetaTags'
import metaTagsImageUrl from 'assets/images/page-cover.png'

// document.body is undefined in SSR
export const NimiPage = dynamic(
  async () => {
    const NimiCardModule = await import('@nimi.io/card')

    return NimiCardModule.NimiPage
  },
  { ssr: false }
)

export function NimiPageRenderer({ nimi }: { nimi: Nimi }) {
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
      <NimiPage isApp={true} nimi={nimi} />
    </>
  )
}

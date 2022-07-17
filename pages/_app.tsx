import type { AppProps } from 'next/app'

import { FixedGlobalStyle, ThemeProvider } from '../theme'
import Script from 'next/script'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <FixedGlobalStyle />
      {process.env.FATHOM_SITE_ID != undefined && (
        <Script
          src='https://upright-kings-leon.nimi.page/script.js'
          data-site='SDKHMKFL'
          data-auto='true'
          defer
        />
      )}
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp

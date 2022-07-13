import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import * as Fathom from 'fathom-client'
import { useEffect } from 'react'

import { FixedGlobalStyle, ThemeProvider } from '../theme'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    if (!process.env.FATHOM_TRACKING_CODE) {
      return
    }

    Fathom.load(process.env.FATHOM_TRACKING_CODE, {
      url: window.location.href,
    })

    function onRouteChangeComplete() {
      Fathom.trackPageview()
    }

    // Record a pageview when route changes
    router.events.on('routeChangeComplete', onRouteChangeComplete)

    // Unassign event listener
    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  })

  return (
    <ThemeProvider>
      <FixedGlobalStyle />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp

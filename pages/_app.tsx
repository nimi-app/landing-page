import type { AppProps } from 'next/app'
import Head from 'next/head'
import { FixedGlobalStyle, ThemeProvider } from '../theme'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <FixedGlobalStyle />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp

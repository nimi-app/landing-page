import React from 'react'
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <meta name='revision' content={process.env.GIT_REVISION} />
        <meta name='commit' content={process.env.GIT_COMMIT} />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,700;0,900;1,900&display=swap'
          rel='stylesheet'
        />
        <link rel='icon' href='./favicon.png' />
        <link rel='alternate icon' type='image/png' href='./favicon.png' />
        <link
          rel='icon'
          sizes='any'
          type='image/svg+xml'
          href='./favicon.svg'
        />
        <link rel='apple-touch-icon' href='./logo192.png' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

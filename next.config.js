/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
  reactStrictMode: true,
  env: {
    PORT: process.env.PORT || 3000,
    FATHOM_SITE_ID: process.env.FATHOM_SITE_ID,
  },
  experimental: {
    outputStandalone: true,
  },
}

module.exports = nextConfig

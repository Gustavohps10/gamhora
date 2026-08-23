import { createMDX } from 'fumadocs-mdx/next'
import type { NextConfig } from 'next'

const withMDX = createMDX()

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },

  reactCompiler: true,

  transpilePackages: ['@metric-org/ui', '@metric-org/application'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        pathname: '/gh/homarr-labs/**',
      },
    ],
  },
}

export default withMDX(nextConfig)

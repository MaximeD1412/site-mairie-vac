import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig = {
  experimental: {},
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

export default withPayload(nextConfig)

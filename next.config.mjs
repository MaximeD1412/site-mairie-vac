import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig = {
  experimental: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
}

export default withPayload(nextConfig)

import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '@/payload.config'

export const generateMetadata = ({ params, searchParams }: any) =>
  generatePageMetadata({ config, params, searchParams })

export default RootPage({ config })

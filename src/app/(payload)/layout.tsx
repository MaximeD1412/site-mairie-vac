import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
// @ts-ignore — no type declarations for this CSS export
import '@payloadcms/next/css'
import './custom.scss'
import React from 'react'
import config from '@/payload.config'
import { importMap } from './admin/importMap.js'

type Args = {
  children: React.ReactNode
}

const serverFunction = async (args: { args: Record<string, unknown>; name: string }) => {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

export default function Layout({ children }: Args) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}

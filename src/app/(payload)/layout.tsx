/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. MODIFY AT YOUR OWN RISK. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { Metadata } from 'next'
import type { ServerFunctionClient } from 'payload'
import {
  handleServerFunctions,
  RootLayout,
} from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './cms/importMap.js'
import './custom.css'

export const metadata: Metadata = {
  icons: {
    icon: [
      {
        url: '/assets/img/unalome-favicon.png',
        type: 'image/png',
      },
    ],
    shortcut: '/assets/img/unalome-favicon.png',
    apple: '/assets/img/unalome-favicon.png',
  },
}

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout

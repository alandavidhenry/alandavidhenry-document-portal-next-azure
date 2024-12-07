import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  env: {
    AZURE_STORAGE_CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME!
  }
}

export default nextConfig

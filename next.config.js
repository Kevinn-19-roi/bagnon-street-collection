/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
  images: {
    unoptimized: true,
  },
}
module.exports = nextConfig

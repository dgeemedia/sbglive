/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  experimental: {
    optimizePackageImports: ['sanity', '@sanity/vision'],
  },
  // Don't fail build if env vars are missing
  typescript: {
    ignoreBuildErrors: true,
  },
  // Next.js 16 removed the built-in eslint build step entirely — run
  // `npx eslint .` yourself (or in CI) if you want lint checks.
  turbopack: {
    // Pins the workspace root to this folder so Turbopack stops guessing
    // when it finds other lockfiles higher up on your machine.
    root: path.join(__dirname),
  },
}

module.exports = nextConfig
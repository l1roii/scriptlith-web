/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: false,
  },
  transpilePackages: ['three'],
}

module.exports = nextConfig
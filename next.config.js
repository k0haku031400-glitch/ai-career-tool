/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // AWS Amplify対応: 静的ファイルの最適化
  images: {
    unoptimized: false,
  },
}

module.exports = nextConfig


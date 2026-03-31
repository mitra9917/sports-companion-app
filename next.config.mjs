/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // We only keep transpilePackages to fix the ESM export issue
  transpilePackages: ['@mediapipe/pose', '@tensorflow-models/pose-detection'],
}

export default nextConfig
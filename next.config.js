/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'jade-rainy-parrotfish-621.mypinata.cloud',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.ipfs.dweb.link',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        port: '',
        pathname: '/**',
      }
    ],
    unoptimized: true,
  },
  experimental: {
    externalDir: true,
  },
  webpack: (config, { isServer }) => {
    // Handle React Native modules in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': require.resolve('@react-native-async-storage/async-storage'),
        'pino-pretty': require.resolve('pino-pretty'),
        'react-native': false,
        'react-native-fs': false,
      };
    }
    
    return config;
  },
}

module.exports = nextConfig
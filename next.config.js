module.exports = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerous: allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  // Exclude contract folder from build
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.alias['@/contract'] = false;
    return config;
  },
}
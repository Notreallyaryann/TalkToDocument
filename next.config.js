/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
 
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: [
      'pdf-parse',
      '@xenova/transformers',
    ],
    outputFileTracingExcludes: {
      '**/*': [
        '.model_cache/**/*',
      ]
    },
  },
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        '@xenova/transformers',
      ];

      
      config.module.rules.push({
        test: /\.m?js$/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      });
    }
    return config;
  },
};

module.exports = nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || [])];
    }

    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: "commons",
              chunks: "all",
              minChunks: 2,
            },
          },
        },
      };
    }

    return config;
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
};

export default nextConfig;

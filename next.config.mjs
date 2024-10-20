/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'backend-c32.onrender.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.discordapp.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.icon-icons.com',
        pathname: '/**',
      },
    ],
  }
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for minimal standalone Docker image
  output: 'standalone',

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }],
      },
    ];
  },
};

export default nextConfig;

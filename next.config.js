/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Use the HTML file as the main page
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/page.html',
      },
    ];
  },
}

module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
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
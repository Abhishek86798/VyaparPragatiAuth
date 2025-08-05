/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: process.env.NETLIFY ? 'export' : 'standalone', // Static export for Netlify, standalone for Docker
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header for security
  generateEtags: false, // Disable ETags for better caching control
  
  // Image optimization
  images: {
    domains: [], // Add any image domains you need
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers (only for standalone mode)
  ...(process.env.NETLIFY ? {} : {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin',
            },
          ],
        },
      ];
    },
  }),
}

module.exports = nextConfig 
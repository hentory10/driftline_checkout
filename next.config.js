/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/checkout/1-package',
        permanent: true,
      },
    ];
  },
  // Server Actions are available by default in Next.js 14+
  // No need for experimental.serverActions configuration
  
  // Image configuration
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: [],
  },
  
  // Configure headers to allow unsafe-eval in development (for React dev overlay)
  async headers() {
    // Only apply CSP in production, or use a more permissive policy in development
    // Next.js development mode requires 'unsafe-eval' for hot reloading
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: "script-src 'self' 'unsafe-inline' https://www.paypal.com https://www.sandbox.paypal.com https://js.stripe.com; object-src 'none'; base-uri 'self'; connect-src 'self' https://www.paypal.com https://www.sandbox.paypal.com https://api.stripe.com; frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com https://js.stripe.com; img-src 'self' data: blob:;",
            },
          ],
        },
      ];
    }
    // In development, don't set CSP headers (Next.js needs eval for HMR)
    // Or use a very permissive policy
    return [];
  },
};

module.exports = nextConfig; 
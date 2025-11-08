import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  devIndicators:false,
  reactStrictMode: false,
  turbopack: {},
};


// Wrap withPWA configuration
export default withPWA({
  dest: 'public',          // Where to output service worker
  register: true,          // Auto register service worker
  skipWaiting: true,       // Activate SW immediately after install
  disable: isDev,          // Disable PWA during development
})(nextConfig as any);



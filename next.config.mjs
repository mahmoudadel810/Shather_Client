/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    // allow Cloudinary external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    // alternatively:
    // domains: ['res.cloudinary.com'],
  },
};

export default nextConfig;

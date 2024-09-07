/** @type {import('next').NextConfig} */
const nextConfig = {
  test: /\.(png|jpg|jpeg|gif|mp3|mp4|pdf|wav)$/, // Add your file types here
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
};

export default nextConfig;

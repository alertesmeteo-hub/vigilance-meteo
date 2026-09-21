import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    // L'outre-mer a son propre site.
    return [{ source: '/outre-mer', destination: 'https://outre-mers.alertes-meteo.com', permanent: false }];
  },
};

export default nextConfig;

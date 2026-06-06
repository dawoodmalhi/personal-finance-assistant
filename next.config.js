module.exports = {
  reactStrictMode: true,
  // `swcMinify` and `experimental.appDir` are no longer valid keys in newer Next versions.
  // Next handles minification and the app directory by default. Update other keys as needed.
  images: {
    // Replace domains with remotePatterns to avoid the deprecation warning and allow
    // more control over allowed remote image sources.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};
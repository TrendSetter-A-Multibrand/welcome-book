import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Картинки, которые редактор загружает в Storyblok, отдаются с его хоста, а
    // next/image отказывается от любого хоста, о котором ему не сказали. Только
    // папка нашего пространства, чтобы через нас нельзя было гонять чужие картинки.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a.storyblok.com",
        pathname: process.env.STORYBLOK_SPACE_ID
          ? `/f/${process.env.STORYBLOK_SPACE_ID}/**`
          : "/f/**",
      },
    ],
  },
};

export default nextConfig;

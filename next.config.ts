import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // スマホなど同じWi-Fi上の別端末からLAN IP経由でdevサーバーにアクセスできるようにする
  allowedDevOrigins: ["192.168.1.7"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "p7mr94yika.ufs.sh",
                pathname: "/f/**",
            },
        ],
    },
};

export default nextConfig;

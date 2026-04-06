import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

function getTrustedOrigins() {
  const origins = new Set<string>([
    "http://localhost:3000",
    "https://memehunt.tech",
    "https://www.memehunt.tech",
  ]);

  try {
    origins.add(new URL(baseURL).origin);
  } catch {}

  return [...origins];
}

export const auth = betterAuth({
    baseURL, 
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: getTrustedOrigins(), 
socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
});

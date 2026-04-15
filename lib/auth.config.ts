import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { env } from "@/lib/env";

export const authConfig = {
  secret: env.AUTH_SECRET,
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      from: `Recall <no-reply@${env.APP_DOMAIN}>`,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const devBypass = env.DEV_BYPASS_LOGIN === "true";
      if (devBypass) return true;

      const isLoggedIn = !!auth?.user;
      const isProtectedAppPath = nextUrl.pathname === "/app" || nextUrl.pathname.startsWith("/app/");
      const isAppAuthPath = nextUrl.pathname === "/app/login";

      if (isAppAuthPath) {
        return true;
      }

      if (isProtectedAppPath) {
        return isLoggedIn;
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/app/login",
  },
} satisfies NextAuthConfig;

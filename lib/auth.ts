import NextAuth from "next-auth";
import type { Session } from "next-auth";
import PostgresAdapter from "@auth/pg-adapter";
import { db, poolInstance } from "@/lib/db";
import { env } from "@/lib/env";
import { authConfig } from "./auth.config";

// Dev-only mock session
const devBypass = env.DEV_BYPASS_LOGIN === "true";
const DEV_USER_ID = "00000000-0000-4000-8000-000000000001";
const DEV_USER_EMAIL = "dev@example.com";
const DEV_USER = {
  id: DEV_USER_ID,
  name: "Dev User",
  email: DEV_USER_EMAIL,
};

const devSession: Session = {
  user: DEV_USER,
  expires: "9999-12-31T23:59:59.999Z",
};

async function ensureDevUser() {
  if (!devBypass) return;

  await db.query(
    `INSERT INTO users (id, name, email)
     VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE
     SET name = EXCLUDED.name, email = EXCLUDED.email`,
    [DEV_USER_ID, DEV_USER.name, DEV_USER_EMAIL],
  );
}

const nextAuth = NextAuth({
  ...authConfig,
  adapter: devBypass ? undefined : PostgresAdapter(poolInstance),
  secret: env.AUTH_SECRET,
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token, user }) {
      if (devBypass) {
        await ensureDevUser();
        return { ...session, ...devSession };
      }
      
      // Map the user ID correctly
      if (session.user) {
        if (user?.id) {
          session.user.id = user.id;
        } else if (token?.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
  },
});

export const { handlers, signIn, signOut } = nextAuth;

export async function auth(): Promise<Session | null> {
  if (devBypass) {
    await ensureDevUser();
    return devSession;
  }

  return nextAuth.auth();
}

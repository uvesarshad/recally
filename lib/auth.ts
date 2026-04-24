import NextAuth from "next-auth";
import type { Session } from "next-auth";
import PostgresAdapter from "@auth/pg-adapter";
import { db, poolInstance } from "@/lib/db";
import { env } from "@/lib/env";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
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
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: env.RESEND_FROM_EMAIL || env.EMAIL_FROM || `Recall <no-reply@${env.APP_DOMAIN || "localhost"}>`,
      async sendVerificationRequest({ identifier, url, provider }) {
        if (process.env.NODE_ENV === "development" && !env.RESEND_API_KEY) {
          console.log("\n--- DEVELOPMENT MAGIC LINK ---");
          console.log(`To: ${identifier}`);
          console.log(`URL: ${url}`);
          console.log("------------------------------\n");
          return;
        }
        
        // Default Resend behavior if key exists
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to: identifier,
            subject: `Sign in to Recall`,
            html: `Click here to sign in: <a href="${url}">${url}</a>`,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(`Resend error: ${JSON.stringify(error)}`);
        }
      },
    }),
  ],
  adapter: devBypass ? undefined : PostgresAdapter(poolInstance),
  secret: env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token, user }) {
      if (devBypass) {
        await ensureDevUser();
        return { ...session, ...devSession };
      }
      
      // Map the user ID correctly from the database user or the JWT token
      if (session.user) {
        const userId = user?.id || token?.sub;
        if (userId) {
          session.user.id = userId;
        }
      }
      return session;
    },
  },
});

export const { handlers, signIn, signOut, auth: baseAuth } = nextAuth;

export async function auth(): Promise<Session | null> {
  if (devBypass) {
    await ensureDevUser();
    return devSession;
  }

  try {
    return await baseAuth();
  } catch (error) {
    console.error("Internal Auth error:", error);
    return null;
  }
}

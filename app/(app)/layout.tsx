import AppShell from "@/components/AppShell";
import PWASetup from "@/components/PWASetup";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  manifest: "/manifest.json",
  applicationName: "Recall",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Recall",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth();
  } catch (error) {
    console.error("Auth error in app layout:", error);
    session = null;
  }

  if (!session) {
    redirect("/app/login");
  }
  const user = {
    id: session.user?.id,
    name: session.user?.name,
    email: session.user?.email,
    image: session.user && "image" in session.user ? (session.user.image as string | null | undefined) : undefined,
  };

  return (
    <>
      <PWASetup />
      <AppShell user={user}>{children}</AppShell>
    </>
  );
}

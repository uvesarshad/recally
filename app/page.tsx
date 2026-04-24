import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Brain, Network, Search, Sparkles, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-bg font-sans text-text-primary antialiased selection:bg-brand/30 selection:text-brand">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-full w-full -translate-x-1/2 bg-[radial-gradient(circle_at_50%_-20%,var(--color-brand-glow),transparent_70%)]" />
        <div className="absolute left-[10%] top-[10%] h-[30%] w-[30%] animate-blob rounded-full bg-brand/5 blur-[120px]" />
        <div
          className="absolute bottom-[10%] right-[10%] h-[40%] w-[40%] animate-blob rounded-full bg-item-media/5 blur-[120px]"
          style={{ animationDelay: "4s" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      <Navbar />

      <main className="flex flex-1 flex-col">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <UseCasesSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.05] bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="group flex cursor-pointer items-center gap-2.5">
          <div className="relative">
            <Brain className="relative z-10 h-6 w-6 text-brand" />
            <div className="absolute inset-0 bg-brand opacity-0 blur-md transition-opacity group-hover:opacity-50" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary">Recall</span>
        </div>

        <nav className="mr-8 hidden items-center gap-8 md:flex">
          <Link href="#features" className="text-sm font-medium text-text-mid transition-colors hover:text-text-primary">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-text-mid transition-colors hover:text-text-primary">
            How it works
          </Link>
          <Link href="https://github.com/uvesarshad/recallQ" className="text-sm font-medium text-text-mid transition-colors hover:text-text-primary">
            GitHub
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/app/login" className="text-sm font-medium text-text-mid transition-colors hover:text-text-primary">
            Sign In
          </Link>
          <Link
            href="/app"
            className="flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-black shadow-lg transition-all hover:scale-105 hover:bg-white/90 active:scale-95"
          >
            Open App
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 pb-20 pt-24 text-center sm:pb-32 sm:pt-40">
      <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-[13px] font-medium text-text-mid backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <Sparkles className="h-3.5 w-3.5 text-brand" />
        <span>Intelligence for your digital life</span>
      </div>

      <h1 className="mb-8 max-w-5xl text-5xl font-black leading-[1] tracking-tight text-text-primary animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 sm:text-8xl">
        Your mind, <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">extended.</span>
      </h1>

      <p className="mb-12 max-w-2xl text-lg font-medium leading-relaxed text-text-mid animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 sm:text-2xl">
        Frictionless capture. AI-powered organization. <br className="hidden sm:block" />
        The last knowledge tool you&apos;ll ever need.
      </p>

      <div className="mb-24 flex w-full flex-col items-center gap-5 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500 sm:w-auto sm:flex-row">
        <Link
          href="/app"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-10 py-4 text-base font-bold text-white shadow-[0_0_40px_-5px_var(--color-brand)] transition-all hover:-translate-y-1 hover:bg-brand-hover hover:shadow-[0_0_50px_-5px_var(--color-brand)] active:scale-95 sm:w-auto"
        >
          Get Started Free
          <ArrowRight className="h-5 w-5" />
        </Link>
        <Link
          href="https://github.com/uvesarshad/recallQ"
          target="_blank"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-10 py-4 text-base font-bold text-text-primary transition-all hover:bg-white/[0.08] active:scale-95 sm:w-auto"
        >
          View Source
        </Link>
      </div>

      <div className="relative mx-auto w-full max-w-[1100px] animate-in fade-in zoom-in-95 duration-1000 delay-700">
        <div className="absolute inset-0 -z-10 scale-90 rounded-full bg-brand/20 blur-[100px]" />
        <div className="relative rounded-2xl bg-gradient-to-b from-white/20 to-transparent p-[1px]">
          <div className="overflow-hidden rounded-2xl bg-bg/50 backdrop-blur-2xl">
            <div className="flex h-8 w-full items-center gap-1.5 border-b border-white/[0.05] bg-white/[0.05] px-4">
              <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
            </div>
            <Image
              src="/recall-hero-mockup.png"
              alt="Recall App Interface"
              width={1200}
              height={700}
              className="w-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      title: "Immediate Capture",
      description: "Send links, notes, or files from any surface - Telegram, Email, Web, or PWA Share.",
      icon: <Zap className="h-6 w-6" />,
      color: "text-item-link",
      bg: "bg-item-link/10",
    },
    {
      title: "AI Enrichment",
      description: "Gemini AI automatically summarizes, categorizes, and indexes your content in seconds.",
      icon: <Sparkles className="h-6 w-6" />,
      color: "text-brand",
      bg: "bg-brand/10",
    },
    {
      title: "Semantic Recall",
      description: "Search by meaning or explore connections in an infinite knowledge graph.",
      icon: <Search className="h-6 w-6" />,
      color: "text-item-note",
      bg: "bg-item-note/10",
    },
  ];

  return (
    <section id="how-it-works" className="relative mx-auto w-full max-w-7xl px-6 py-32">
      <div className="mb-20 text-center">
        <h2 className="mb-6 text-4xl font-bold tracking-tight text-text-primary sm:text-6xl">
          Capture once. <br />
          <span className="text-text-mid">Remember forever.</span>
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-text-muted">
          No manual tagging. No rigid folders. Just frictionless flow for your thoughts.
        </p>
      </div>

      <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
        <div className="absolute left-[15%] right-[15%] top-12 hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent md:block" />

        {steps.map((step, idx) => (
          <div key={idx} className="group relative flex flex-col items-center text-center">
            <div className={`relative z-10 mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/5 ${step.bg} ${step.color} transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110`}>
              {step.icon}
              <div className="absolute inset-0 rounded-3xl bg-current opacity-0 blur-xl transition-opacity group-hover:opacity-20" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-text-primary">{step.title}</h3>
            <p className="max-w-[280px] leading-relaxed text-text-mid">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="relative mx-auto w-full max-w-7xl border-t border-white/[0.05] px-6 py-32">
      <div className="mb-20">
        <h2 className="mb-6 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          Everything you need. <br />
          <span className="font-medium text-text-mid">Nothing you don&apos;t.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="group relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04] md:col-span-8 sm:p-12">
          <div className="relative z-10 max-w-md">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/20 text-brand">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="mb-4 text-3xl font-bold text-text-primary">AI-First Organization</h3>
            <p className="text-lg leading-relaxed text-text-mid">
              Stop wasting time on manual metadata. Our AI pipeline automatically summarizes, tags, and categorizes everything you capture. It even extracts key entities and sentiments.
            </p>
          </div>
          <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-2/3 opacity-20 transition-opacity group-hover:opacity-40">
            <div className="aspect-square rounded-full bg-brand blur-[100px]" />
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04] md:col-span-4">
          <div className="relative z-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-item-link/20 text-item-link">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-text-primary">Instant Capture</h3>
            <p className="leading-relaxed text-text-mid">
              Whether it&apos;s a Telegram message, an email, or a browser link, capture is strictly one step away.
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04] md:col-span-4">
          <div className="relative z-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-item-media/20 text-item-media">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-text-primary">Semantic Search</h3>
            <p className="leading-relaxed text-text-mid">
              Find items by what they mean, not just the keywords they contain. &quot;That article about quantum physics&quot; just works.
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04] md:col-span-8 sm:p-12">
          <div className="relative z-10 flex flex-col items-center gap-12 md:flex-row">
            <div className="flex-1">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-item-note/20 text-item-note">
                <Network className="h-6 w-6" />
              </div>
              <h3 className="mb-4 text-3xl font-bold text-text-primary">Infinite Knowledge Graph</h3>
              <p className="text-lg leading-relaxed text-text-mid">
                Visualize your digital workspace as a living network. Discover connections you never knew existed between your disparate thoughts.
              </p>
            </div>
            <div className="flex w-full flex-1 items-center justify-center">
              <div className="relative aspect-square w-full max-w-[200px]">
                <div className="absolute inset-0 rounded-full bg-item-note/20 blur-3xl" />
                <Network className="h-full w-full animate-pulse text-item-note opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  const cases = [
    { text: "Researchers managing complex knowledge webs", icon: <Brain className="h-5 w-5" /> },
    { text: "Developers saving snippets and documentation", icon: <Zap className="h-5 w-5" /> },
    { text: "Writers collecting inspiration and drafts", icon: <Sparkles className="h-5 w-5" /> },
    { text: "Students organizing study materials", icon: <Search className="h-5 w-5" /> },
    { text: "Curious minds building a private Wikipedia", icon: <Network className="h-5 w-5" /> },
  ];

  return (
    <section className="relative mx-auto w-full max-w-5xl border-t border-white/[0.05] px-6 py-32">
      <div className="relative overflow-hidden rounded-[40px] border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-12 sm:p-20">
        <div className="absolute right-0 top-0 h-1/2 w-1/2 rounded-full bg-brand/10 blur-[120px]" />

        <div className="relative z-10">
          <h2 className="mb-12 text-center text-3xl font-bold text-text-primary sm:text-5xl">Built for thinkers.</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {cases.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.05]">
                <div className="shrink-0 text-brand">{entry.icon}</div>
                <p className="text-lg font-medium text-text-primary">{entry.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 py-40 text-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,var(--color-brand-glow),transparent_70%)] opacity-50" />

      <h2 className="mb-8 text-5xl font-black tracking-tighter text-text-primary animate-pulse sm:text-7xl">
        Ready to expand <br /> your mind?
      </h2>
      <p className="mx-auto mb-12 max-w-2xl text-xl font-medium text-text-mid">
        Join thousands of thinkers who have automated their knowledge management. Free, open-source, and forever yours.
      </p>
      <div className="flex flex-col justify-center gap-6 sm:flex-row">
        <Link
          href="/app"
          className="flex items-center justify-center gap-2 rounded-full bg-brand px-12 py-5 text-lg font-bold text-white shadow-[0_0_40px_-5px_var(--color-brand)] transition-all hover:-translate-y-1 hover:bg-brand-hover hover:shadow-[0_0_60px_-5px_var(--color-brand)] active:scale-95"
        >
          Start Your Brain
          <ArrowRight className="h-6 w-6" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/[0.05] bg-bg px-6 py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-6 flex items-center gap-2.5">
            <Brain className="h-6 w-6 text-brand" />
            <span className="text-xl font-bold tracking-tight text-text-primary">Recall</span>
          </div>
          <p className="mb-8 max-w-xs leading-relaxed text-text-muted">
            The intelligent layer for your digital life. Capture, enrich, and recall anything instantly.
          </p>
          <div className="flex gap-4">
            <Link href="https://github.com/uvesarshad/recallQ" className="rounded-full border border-white/[0.08] bg-white/[0.03] p-2 transition-colors hover:bg-white/[0.08]">
              <span className="sr-only">GitHub</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </Link>
          </div>
        </div>

        <div>
          <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-text-primary">Product</h4>
          <ul className="space-y-4">
            <li>
              <Link href="#features" className="text-text-muted transition-colors hover:text-text-primary">
                Features
              </Link>
            </li>
            <li>
              <Link href="#how-it-works" className="text-text-muted transition-colors hover:text-text-primary">
                How it Works
              </Link>
            </li>
            <li>
              <Link href="/app" className="text-text-muted transition-colors hover:text-text-primary">
                Open App
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-text-primary">Company</h4>
          <ul className="space-y-4">
            <li>
              <Link href="https://github.com/uvesarshad/recallQ" className="text-text-muted transition-colors hover:text-text-primary">
                Open Source
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-text-muted transition-colors hover:text-text-primary">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-text-muted transition-colors hover:text-text-primary">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-20 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/[0.05] pt-8 sm:flex-row">
        <p className="text-sm text-text-muted">© {new Date().getFullYear()} Recall. Built with love by the open source community.</p>
        <p className="text-sm uppercase tracking-tighter text-text-muted">v1.0.0-beta</p>
      </div>
    </footer>
  );
}

"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

type ProfileResponse = {
  user: {
    name?: string | null;
    email?: string | null;
    plan: "free" | "starter" | "pro";
    subscription_plan?: "starter" | "pro" | null;
    subscription_status?: string | null;
    subscription_current_start?: string | null;
    subscription_current_end?: string | null;
    subscription_cancel_at_cycle_end?: boolean | null;
    razorpay_subscription_id?: string | null;
  } | null;
  billing: {
    enabled: boolean;
    selfHosted: boolean;
  };
};

const planCards = [
  {
    id: "free",
    title: "Free",
    price: "Free",
    features: ["50 saves/month", "100 MB file storage", "20 chat queries/day", "2 active reminders"],
  },
  {
    id: "starter",
    title: "Starter",
    price: "$29/year",
    features: ["100 saves/month", "1 GB file storage", "50 chat queries/day", "30 active reminders", "Email forwarding"],
  },
  {
    id: "pro",
    title: "Pro",
    price: "$99/year",
    features: ["Unlimited saves", "10 GB file storage", "Unlimited chat queries", "Unlimited reminders", "Email forwarding"],
  },
] as const;

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

async function ensureRazorpayScript() {
  if (window.Razorpay) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

export default function BillingSettingsClient() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingPlan, setSubmittingPlan] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProfile() {
    setLoading(true);
    const res = await fetch("/api/me");
    const data = (await res.json()) as ProfileResponse;
    setProfile(data);
    setLoading(false);
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  async function startCheckout(plan: "starter" | "pro") {
    setError(null);
    setSubmittingPlan(plan);

    try {
      const res = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }

      await ensureRazorpayScript();
      if (!window.Razorpay) {
        throw new Error("Razorpay checkout is unavailable");
      }

      const instance = new window.Razorpay({
        key: data.key,
        subscription_id: data.subscriptionId,
        name: "Recall",
        description: `${data.planLabel} annual subscription`,
        handler: async () => {
          await loadProfile();
        },
        prefill: {
          name: profile?.user?.name || "",
          email: profile?.user?.email || "",
        },
        theme: {
          color: "#111827",
        },
      });

      instance.open();
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Failed to start checkout");
    } finally {
      setSubmittingPlan(null);
    }
  }

  async function cancelSubscription() {
    setError(null);
    setCancelling(true);

    try {
      const res = await fetch("/api/payments/cancel-subscription", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      await loadProfile();
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  }

  if (loading || !profile?.user) {
    return <div className="rounded-modals border border-border bg-surface p-6 text-sm text-text-muted">Loading billing...</div>;
  }

  if (profile.billing.selfHosted) {
    return (
      <section className="rounded-modals border border-border bg-surface p-6">
        <h1 className="text-lg font-semibold text-text-primary">Billing</h1>
        <p className="mt-2 text-sm text-text-muted">
          This deployment is running in self-hosted mode. Paid plans, Razorpay checkout, and hosted usage limits are disabled here.
        </p>
      </section>
    );
  }

  const user = profile.user;
  const currentPlan = user.plan;
  const currentEnd = formatDate(user.subscription_current_end);
  const hasPaidSubscription = currentPlan !== "free";

  return (
    <div className="space-y-6">
      <section className="rounded-modals border border-border bg-surface p-6">
        <h1 className="text-lg font-semibold text-text-primary">Annual plans</h1>
        <p className="mt-2 text-sm text-text-muted">
          Hosted Recall uses annual billing only. Webhooks update access automatically after successful Razorpay events.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {planCards.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isPaidPlan = plan.id === "starter" || plan.id === "pro";
              const disabled =
                !!submittingPlan ||
                (isCurrent && plan.id !== "free") ||
                (!!user.razorpay_subscription_id && hasPaidSubscription && !isCurrent);

            return (
              <div key={plan.id} className={`rounded-cards border p-5 ${isCurrent ? "border-brand bg-brand/5" : "border-border bg-bg"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">{plan.title}</h2>
                    <p className="mt-1 text-sm text-text-muted">{plan.price}</p>
                  </div>
                  {isCurrent ? (
                    <span className="rounded-full bg-brand px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Current
                    </span>
                  ) : null}
                </div>
                <ul className="mt-4 space-y-2 text-sm text-text-muted">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                {isPaidPlan ? (
                  <button
                    onClick={() => startCheckout(plan.id)}
                    disabled={disabled}
                    className="mt-5 w-full rounded-buttons bg-brand px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingPlan === plan.id ? "Opening checkout..." : isCurrent ? "Current plan" : `Choose ${plan.title}`}
                  </button>
                ) : (
                  <div className="mt-5 rounded-buttons border border-border px-4 py-2 text-center text-sm text-text-muted">
                    Free tier
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-modals border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-text-primary">Subscription status</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-cards border border-border bg-bg p-4">
            <div className="text-xs uppercase tracking-wide text-text-muted">Plan</div>
            <div className="mt-2 text-sm font-medium text-text-primary">{currentPlan}</div>
          </div>
          <div className="rounded-cards border border-border bg-bg p-4">
            <div className="text-xs uppercase tracking-wide text-text-muted">Status</div>
            <div className="mt-2 text-sm font-medium text-text-primary">{user.subscription_status || "free"}</div>
          </div>
          <div className="rounded-cards border border-border bg-bg p-4">
            <div className="text-xs uppercase tracking-wide text-text-muted">Current period ends</div>
            <div className="mt-2 text-sm font-medium text-text-primary">{currentEnd || "Not applicable"}</div>
          </div>
          <div className="rounded-cards border border-border bg-bg p-4">
            <div className="text-xs uppercase tracking-wide text-text-muted">Cancellation</div>
            <div className="mt-2 text-sm font-medium text-text-primary">
              {user.subscription_cancel_at_cycle_end ? "Scheduled at period end" : "Active"}
            </div>
          </div>
        </div>

        {hasPaidSubscription ? (
          <button
            onClick={cancelSubscription}
            disabled={cancelling}
            className="mt-5 rounded-buttons border border-border px-4 py-2 text-sm font-medium text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelling ? "Cancelling..." : "Cancel at period end"}
          </button>
        ) : null}

        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
      </section>
    </div>
  );
}

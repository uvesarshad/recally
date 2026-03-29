ALTER TABLE users
  ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS subscription_current_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_current_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_cancel_at_cycle_end BOOLEAN NOT NULL DEFAULT FALSE;

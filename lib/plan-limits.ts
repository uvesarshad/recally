export type Plan = "free" | "starter" | "pro";

export const PLAN_LIMITS = {
  free: {
    maxSavesPerMonth: 50,
    maxFileUploadSizeMB: 10,
    maxReminders: 2,
    emailIngest: false,
    chatQueriesPerDay: 20,
  },
  starter: {
    maxSavesPerMonth: 100,
    maxFileUploadSizeMB: 10,
    maxReminders: 30,
    emailIngest: true,
    chatQueriesPerDay: 50,
  },
  pro: {
    maxSavesPerMonth: Infinity,
    maxFileUploadSizeMB: 50,
    maxReminders: Infinity,
    emailIngest: true,
    chatQueriesPerDay: Infinity,
  },
};

const SELF_HOSTED_LIMITS = {
  maxSavesPerMonth: Infinity,
  maxFileUploadSizeMB: Number.MAX_SAFE_INTEGER,
  maxReminders: Infinity,
  emailIngest: true,
  chatQueriesPerDay: Infinity,
};

function isSelfHostedMode() {
  return process.env.SELF_HOSTED === "true";
}

export function getPlanLimits(plan: Plan) {
  return isSelfHostedMode() ? SELF_HOSTED_LIMITS : PLAN_LIMITS[plan];
}

export function canUserSave(plan: Plan, savesThisMonth: number) {
  return savesThisMonth < getPlanLimits(plan).maxSavesPerMonth;
}

export function canUseEmailIngest(plan: Plan) {
  return getPlanLimits(plan).emailIngest;
}
